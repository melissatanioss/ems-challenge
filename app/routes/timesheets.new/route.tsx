import { useLoaderData, Form, redirect } from "react-router";
import { getDB } from "~/db/getDB";
import { useState } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export async function loader() {
  const db = await getDB();
  const employees = await db.all('SELECT id, full_name FROM employees');
  return { employees };
}

import type { ActionFunction } from "react-router";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  const summary = formData.get("summary") || ""; // Optional summary field

  // Convert times to Date objects for validation
  const startDate = new Date(start_time as string);
  const endDate = new Date(end_time as string);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return new Response(
      JSON.stringify({ error: "Invalid date format." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (startDate >= endDate) {
    return new Response(
      JSON.stringify({ error: "Start time must be before end time." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const db = await getDB();
  await db.run(
    'INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)',
    [employee_id, start_time, end_time, summary]
  );

  return redirect("/timesheets");
};

export default function NewTimesheetPage() {
  const { employees } = useLoaderData();
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Server returned non-JSON response:", errorText);
        throw new Error("Unexpected server response. Please try again.");
      }

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setSuccess(null);
      } else {
        setError(null);
        setSuccess(result.success);
        setOpenDialog(true);
        form.reset();
      }
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMessage += ` ${error.message}`;
      }
      setError(errorMessage);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create New Timesheet
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Form method="post" onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Select
              name="employee_id"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              displayEmpty
              required
              fullWidth
            >
              <MenuItem value="" disabled>
                Select an Employee
              </MenuItem>
              {employees.map((employee: any) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.full_name}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Start Time"
              type="datetime-local"
              name="start_time"
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />

            <TextField
              label="End Time"
              type="datetime-local"
              name="end_time"
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />

            <TextField
              label="Work Summary"
              name="summary"
              multiline
              rows={3}
              fullWidth
            />

            <Button type="submit" variant="contained" color="primary">
              Create Timesheet
            </Button>
          </Box>
        </Form>
      </Paper>

      <Box mt={2} display="flex" gap={2}>
        <Button variant="outlined" href="/timesheets">
          Timesheets
        </Button>
        <Button variant="outlined" href="/employees">
          Employees
        </Button>
      </Box>

      {/* Success Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Timesheet Created</DialogTitle>
        <DialogContent>
          <DialogContentText>{success}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button href="/timesheets" variant="contained" color="primary">
            View Timesheets
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
