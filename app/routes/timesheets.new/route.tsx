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
} from "@mui/material";

export async function loader() {
  const db = await getDB();
  const employees = await db.all('SELECT id, full_name FROM employees');
  return { employees };
}

import type { ActionFunction } from "react-router";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id"); // <select /> input with name="employee_id"
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");

  const db = await getDB();
  await db.run(
    'INSERT INTO timesheets (employee_id, start_time, end_time) VALUES (?, ?, ?)',
    [employee_id, start_time, end_time]
  );

  return redirect("/timesheets");
}

export default function NewTimesheetPage() {
  const { employees } = useLoaderData(); // Used to create a select input
  const [employeeId, setEmployeeId] = useState("");

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create New Timesheet
        </Typography>
        <Form method="post">
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
    </Container>
  );
}
