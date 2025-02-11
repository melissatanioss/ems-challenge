import { useLoaderData, Form, redirect } from "react-router";
import { getDB } from "~/db/getDB";
import { useState, useEffect } from "react";
import TimesheetForm from "~/components/TimesheetForm";
import type {LoaderFunction, ActionFunction } from "react-router";
import { handleTimesheet } from "~/utilities/handle_timesheet";

export const action: ActionFunction = async ({ request }) => {
  return handleTimesheet(request, false); 
};

export const loader: LoaderFunction = async ({ request }) => {
  const db = await getDB();
  const employees = await db.all('SELECT id, full_name FROM employees');

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const success = url.searchParams.get("success");

  return { employees, error, success };
}


export default function NewTimesheetPage() {
  const [hydrated, setHydrated] = useState(false);
  const { employees, error, success } = useLoaderData();

  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) return null;

  return (<TimesheetForm employees={employees} submitLabel="Create Timesheet" error={error} success={success} />);

}
