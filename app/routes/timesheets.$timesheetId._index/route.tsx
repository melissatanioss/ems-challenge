import { useLoaderData } from "react-router";
import { getDB } from "~/db/getDB";
import TimesheetForm from "~/components/TimesheetForm";
import { handleTimesheet } from "~/utilities/handle_timesheet";
import type {LoaderFunction, ActionFunction } from "react-router";
import { useState, useEffect } from "react";

function formatDateTime(datetime: string) {
  return datetime ? new Date(datetime).toISOString().slice(0, 16) : "";
}

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
  return {
    timesheet: {
      ...timesheet,
      start_time: formatDateTime(timesheet.start_time),
      end_time: formatDateTime(timesheet.end_time),
    },
    employees,
  };
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
  
  return (
    <TimesheetForm 
      employees={employees} 
      defaultValues={timesheet || { id: 0, start_time: "", end_time: "", summary: "", full_name: "", employee_id: 0 }}
      submitLabel="Update Timesheet"
    />
  );
  
}
