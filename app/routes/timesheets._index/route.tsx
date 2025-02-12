import { useLoaderData, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { getDB } from "~/db/getDB";
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  TextField,
  Switch,
  FormControlLabel,
  Button,
} from "@mui/material";
import { ScheduleXCalendar } from "@schedule-x/react";
import { createCalendar, createViewDay, createViewMonthAgenda, createViewMonthGrid, createViewWeek} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-default/dist/index.css";
import type { TimesheetData } from '~/components/TimesheetForm';

// Utility function to format date for Schedule-X (YYYY-MM-DD HH:mm)
const formatScheduleXDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

export async function loader() {
  try {
    const db = await getDB();
    const timesheets: TimesheetData[] = await db.all(`
      SELECT timesheets.id, timesheets.start_time, timesheets.end_time, timesheets.summary,
             employees.full_name, employees.id AS employee_id
      FROM timesheets
      JOIN employees ON timesheets.employee_id = employees.id
      ORDER BY timesheets.start_time DESC
    `);
    return { timesheets };
  } catch (error) {
    console.error("Loader Error:", error);
    throw new Response("Failed to load timesheets.", { status: 500 });
  }
}

export default function TimesheetsPage() {
  const { timesheets } = useLoaderData() as { timesheets: TimesheetData[] };
  const [isTableView, setIsTableView] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const [hydrated, setHydrated] = useState(false);
  const [eventsServicePlugin] = useState(() => createEventsServicePlugin());

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Filtered timesheets (used for both table and calendar views)
  const filteredTimesheets = useMemo(
    () =>
      timesheets.filter(
        (t) =>
          t.full_name.toLowerCase().includes(search.toLowerCase()) &&
          (selectedEmployee ? t.employee_id === Number(selectedEmployee) : true) &&
          new Date(t.start_time) < new Date(t.end_time)
      ),
    [timesheets, search, selectedEmployee]
  );

  const filteredEvents = useMemo(
    () =>
      filteredTimesheets.map((t) => ({
        id: t.id.toString(),
        title: `${t.full_name} - ${t.summary || "No Summary"}`,
        start: formatScheduleXDate(t.start_time),
        end: formatScheduleXDate(t.end_time),
      })),
    [filteredTimesheets]
  );
  
  const calendar = createCalendar({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    defaultView: createViewMonthGrid().name,
    plugins: [eventsServicePlugin],
    events: filteredEvents
  });
  
  useEffect(() => {
    eventsServicePlugin.set(filteredEvents);
  }, [filteredEvents, eventsServicePlugin]);  


  // Pagination Logic
  const totalPages = Math.ceil(filteredTimesheets.length / rowsPerPage);
  const paginatedTimesheets = filteredTimesheets.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (!hydrated) return null; 

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Timesheets
        </Typography>

        {/* Search & Filtering */}
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Search Employee"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Employee</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <MenuItem value="">All</MenuItem>
              {Array.from(new Map(timesheets.map((t) => [t.employee_id, t.full_name]))).map(([id, name]) => (
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Toggle Table/Calendar View */}
        <FormControlLabel
          control={
            <Switch
              checked={isTableView}
              onChange={() => setIsTableView(!isTableView)}
              color="primary"
            />
          }
          label={isTableView ? "Table View" : "Calendar View"}
          sx={{ mb: 2 }}
        />

        {/* Table View */}
        {isTableView ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Summary</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTimesheets.map((timesheet) => (
                  <TableRow key={timesheet.id} sx={{ cursor: "pointer" }}>
                    <TableCell>
                      <Link to={`/timesheets/${timesheet.id}`} style={{ textDecoration: "none" }}>
                        {timesheet.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>{timesheet.summary || "No Summary"}</TableCell>
                    <TableCell>{formatScheduleXDate(timesheet.start_time)}</TableCell>
                    <TableCell>{formatScheduleXDate(timesheet.end_time)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          // Calendar View using Schedule-X
          <ScheduleXCalendar key={filteredEvents.length} calendarApp={calendar} />
        )}

        {/* Pagination Controls */}
        {isTableView && (
          <Box mt={2} display="flex" justifyContent="center">
            <Pagination count={totalPages} page={page} onChange={(_, newPage) => setPage(newPage)} color="primary" />
          </Box>
        )}

        {/* Navigation Buttons */}
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
