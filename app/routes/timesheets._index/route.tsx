import { useLoaderData } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    "SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id"
  );

  return { timesheetsAndEmployees };
}

export default function TimesheetsPage() {
  const { timesheetsAndEmployees } = useLoaderData();
  const [isTableView, setIsTableView] = useState(true);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Timesheets
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <Button
            variant={isTableView ? "contained" : "outlined"}
            onClick={() => setIsTableView(true)}
          >
            Table View
          </Button>
          <Button
            variant={!isTableView ? "contained" : "outlined"}
            onClick={() => setIsTableView(false)}
          >
            Calendar View
          </Button>
        </Box>

        {isTableView ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timesheetsAndEmployees.map((timesheet: any) => (
                  <TableRow key={timesheet.id}>
                    <TableCell>{timesheet.id}</TableCell>
                    <TableCell>{timesheet.full_name} (ID: {timesheet.employee_id})</TableCell>
                    <TableCell>{timesheet.start_time}</TableCell>
                    <TableCell>{timesheet.end_time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" sx={{ mt: 2 }}>
            To implement, see <a href="https://schedule-x.dev/docs/frameworks/react">Schedule X React documentation</a>.
          </Typography>
        )}

        <Box mt={2} display="flex" gap={2}>
          <Button variant="contained" href="/timesheets/new">
            New Timesheet
          </Button>
          <Button variant="outlined" href="/employees">
            Employees
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
