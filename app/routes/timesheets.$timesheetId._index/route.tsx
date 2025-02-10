import { useLoaderData, Form, redirect } from "react-router";
import { getDB } from "~/db/getDB";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export async function loader({ params }: { params: { timesheetId: string } }) {
  const db = await getDB();
  const timesheet = await db.get(
    `SELECT timesheets.*, employees.full_name 
     FROM timesheets 
     JOIN employees ON timesheets.employee_id = employees.id 
     WHERE timesheets.id = ?`,
    [params.timesheetId]
  );

  if (!timesheet) {
    throw new Response("Timesheet not found", { status: 404 });
  }

  const employees = await db.all("SELECT id, full_name FROM employees");
  return { timesheet, employees };
}

export const action = async ({ request, params }: { request: Request; params: { timesheetId: string } }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id") as string;
  const start_time = formData.get("start_time") as string;
  const end_time = formData.get("end_time") as string;
  const summary = formData.get("summary") as string;

  if (!start_time || !end_time) {
    throw new Response("Start time and End time are required.", { status: 400 });
  }

  const startDate = new Date(start_time);
  const endDate = new Date(end_time);

  if (startDate >= endDate) {
    throw new Response("Start time must be before end time.", { status: 400 });
  }

  const db = await getDB();
  await db.run(
    "UPDATE timesheets SET employee_id = ?, start_time = ?, end_time = ?, summary = ? WHERE id = ?",
    [employee_id, start_time, end_time, summary, params.timesheetId]
  );

  return redirect("/timesheets");
};

export default function EditTimesheetPage() {
  const { timesheet, employees } = useLoaderData();
  const navigate = useNavigate();

  // Ensure the component only renders when timesheet data is available
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null; // Prevents hydration mismatch

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Edit Timesheet
        </Typography>

        <Form method="post">
          <Grid container spacing={2}>
            {/* Employee Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Employee</InputLabel>
                <Select
                  name="employee_id"
                  defaultValue={timesheet?.employee_id || ""}
                  required
                >
                  {employees.map((employee: any) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Time Fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Time"
                type="datetime-local"
                name="start_time"
                InputLabelProps={{ shrink: true }}
                defaultValue={timesheet?.start_time?.slice(0, 16) || ""}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Time"
                type="datetime-local"
                name="end_time"
                InputLabelProps={{ shrink: true }}
                defaultValue={timesheet?.end_time?.slice(0, 16) || ""}
                required
                fullWidth
              />
            </Grid>

            {/* Summary Field */}
            <Grid item xs={12}>
              <TextField
                label="Work Summary"
                name="summary"
                multiline
                rows={3}
                defaultValue={timesheet?.summary || ""}
                fullWidth
              />
            </Grid>
          </Grid>

          <Box mt={3} display="flex" gap={2}>
            <Button type="submit" variant="contained" color="primary">
              Update Timesheet
            </Button>
            <Button variant="outlined" onClick={() => navigate(`/employees/${timesheet?.employee_id}`)}>
              Current Employee
            </Button>
            <Button variant="outlined" href="/timesheets">
              Timesheets
            </Button>
            <Button variant="outlined" href="/employees">
            Employees
          </Button>
          </Box>
        </Form>
      </Paper>
    </Container>
  );
}
