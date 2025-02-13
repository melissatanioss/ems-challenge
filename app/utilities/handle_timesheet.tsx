import { getDB } from "~/db/getDB";

export async function handleTimesheet(request: Request, isUpdate: boolean, timesheetId?: string) {
    try {
        const formData = await request.formData();
        const employee_id = formData.get("employee_id");
        const start_time = formData.get("start_time");
        const end_time = formData.get("end_time");
        const summary = formData.get("summary") || "";

        const startDate = new Date(start_time as string);
        const endDate = new Date(end_time as string);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return new Response(JSON.stringify({ error: "Start time and End time are required." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (startDate >= endDate) {
            return new Response(JSON.stringify({ error: "Start time must be before end time." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const db = await getDB();

        if (isUpdate && timesheetId) {
            // Update existing timesheet
            await db.run(
                "UPDATE timesheets SET employee_id = ?, start_time = ?, end_time = ?, summary = ? WHERE id = ?",
                [employee_id, start_time, end_time, summary, timesheetId]
            );
            return new Response(JSON.stringify({ success: "Timesheet successfully updated!" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } else {
            // Insert new timesheet
            await db.run(
                "INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)",
                [employee_id, start_time, end_time, summary]
            );
            return new Response(JSON.stringify({ success: "Timesheet successfully created!" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (err) {
        console.error("Server error:", err);
        return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error occurred." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};