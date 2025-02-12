import { getDB } from "~/db/getDB";
import { redirect } from "react-router-dom";

export async function handleTimesheet(request: Request, isUpdate: boolean, timesheetId?: string) {
    try {
        const formData = await request.formData();
        const employee_id = formData.get("employee_id");
        const start_time = formData.get("start_time");
        const end_time = formData.get("end_time");
        const summary = formData.get("summary") || "";

        // Convert times to Date objects for validation
        const startDate = new Date(start_time as string);
        const endDate = new Date(end_time as string);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return redirect(`/timesheets/new?error=${encodeURIComponent("Start time and End time are required.")}`);
        }

        if (startDate >= endDate) {
            return redirect(`/timesheets/new?error=${encodeURIComponent("Start time must be before end time.")}`);
        }

        const db = await getDB();

        if (isUpdate && timesheetId) {
            // Update existing timesheet
            await db.run(
                "UPDATE timesheets SET employee_id = ?, start_time = ?, end_time = ?, summary = ? WHERE id = ?",
                [employee_id, start_time, end_time, summary, timesheetId]
            );
            return redirect(`/timesheets`); //Return here without showing success, just different way
        } else {
            // Insert new timesheet
            await db.run(
                "INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)",
                [employee_id, start_time, end_time, summary]
            );
            return redirect(`/timesheets/new?success=${encodeURIComponent("Timesheet successfully created.")}`);
        }
    } catch (err) {
        console.error("Server error:", err);
        return redirect(`/timesheets/new?error=${encodeURIComponent(err instanceof Error ? err.message : "Unknown error occurred.")}`);
    }
};