import { useLoaderData } from "react-router";
import { getDB } from "~/db/getDB";
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

  if (!timesheet) {
    throw new Response(JSON.stringify({ error: "Timesheet not found." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  return { timesheet, employees };
}

export const action: ActionFunction = async ({ request, params }) => {
  return handleTimesheet(request, true, params.timesheetId); 
};

export default function EditTimesheetPage() {
  const { timesheet, employees } = useLoaderData();

  return (<TimesheetForm  employees={employees} defaultValues={timesheet} submitLabel="Update Timesheet"/>
  );
}
