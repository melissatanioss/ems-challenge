import { useLoaderData, Link } from "react-router";
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from "@mui/material";
import { useState, useEffect } from "react";

export async function loader() {
  const db = await getDB()
  const employees = await db.all("SELECT * FROM employees;")
  return { employees }
}

export default function EmployeesPage() {
  const { employees } = useLoaderData();
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [sortField, setSortField] = useState("full_name");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null; // Prevents SSR mismatches

  // Ensure employees is defined before filtering
  const filteredEmployees = (employees || [])
    .filter((e: any) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) &&
      (departmentFilter ? e.department === departmentFilter : true)
    )
    .sort((a: any, b: any) => (a[sortField] > b[sortField] ? 1 : -1));

  // Pagination Logic
  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Employees List
        </Typography>

        {/* Search & Sorting */}
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Search by Name"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <MenuItem value="full_name">Full Name</MenuItem>
              <MenuItem value="department">Department</MenuItem>
              <MenuItem value="start_date">Start Date</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Department</InputLabel>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
           <MenuItem value="">All</MenuItem>
          {(() => {
            // Create a Set<string> explicitly to store unique department names
            const departmentSet: Set<string> = new Set();

            employees.forEach((e: { department: string | null }) => {
              if (typeof e.department === "string" && e.department.trim() !== "") {
                departmentSet.add(e.department);
              }
            });

            return Array.from(departmentSet).map((dep) => (
              <MenuItem key={dep} value={dep}>
                {dep}
              </MenuItem>
            ));
          })()}

            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Job Title</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Start Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmployees.map((employee: any) => (
                <TableRow key={employee.id} sx={{ cursor: "pointer" }}>
                  <TableCell>
                    <Link to={`/employees/${employee.id}`} style={{ textDecoration: "none" }}>
                      {employee.full_name}
                    </Link>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.job_title}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.start_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Controls */}
        <Box mt={2} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>

        {/* Navigation Buttons */}
        <Box mt={2} display="flex" gap={2}>
          <Button variant="contained" href="/employees/new">
            New Employee
          </Button>
          <Button variant="outlined" href="/timesheets/">
            Timesheets
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
