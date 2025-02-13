import { useLoaderData } from "react-router";
import { getDB } from "~/db/getDB";
import TimesheetForm from "~/components/TimesheetForm";
import type { LoaderFunction, ActionFunction } from "react-router";
import { handleTimesheet } from "~/utilities/handle_timesheet";
import { useState, useEffect } from "react";

export const action: ActionFunction = async ({ request }) => {
  return handleTimesheet(request, false);
};

export const loader: LoaderFunction = async () => {
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name FROM employees");
  return { employees };
};


export default function NewTimesheetPage() {
  const { employees } = useLoaderData();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;
  return <TimesheetForm employees={employees} submitLabel="Create Timesheet" />;
}