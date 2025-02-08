import { useLoaderData } from "react-router";
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
  const db = await getDB()
  const employees = await db.all("SELECT * FROM employees;")
  return { employees }
}

export default function EmployeesPage() {
  const { employees } = useLoaderData()
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Employees List
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Full Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee: any) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>{employee.full_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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
