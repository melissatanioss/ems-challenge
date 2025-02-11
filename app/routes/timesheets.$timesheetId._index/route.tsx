import { useLoaderData, Form, redirect } from "react-router";
import { getDB } from "~/db/getDB";
import { useState, useEffect } from "react";
import TimesheetForm from "~/components/TimesheetForm";
import { handleTimesheet } from "~/utilities/handle_timesheet";
import type {LoaderFunction, ActionFunction } from "react-router";

export const loader: LoaderFunction = async ({ request, params }) => {  
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name FROM employees");
  const timesheet = await db.get(
    `SELECT timesheets.*, employees.full_name 
     FROM timesheets 
     JOIN employees ON timesheets.employee_id = employees.id 
     WHERE timesheets.id = ?`,
    [params.timesheetId]
  );

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const success = url.searchParams.get("success");

  return { timesheet, employees, error, success };
}

export const action: ActionFunction = async ({ request, params }) => {
  return handleTimesheet(request, true, params.timesheetId); 
};

export default function EditTimesheetPage() {
  const { timesheet, employees } = useLoaderData();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null; 

  return (<TimesheetForm  employees={employees} defaultValues={timesheet} submitLabel="Update Timesheet"/>
  );
}
