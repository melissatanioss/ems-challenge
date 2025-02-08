import { Container, Paper, Typography, Box, Button } from "@mui/material";

export async function loader() {
  return {}
}

export default function EmployeePage() {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          To implement
        </Typography>

        <Box mt={3} display="flex" flexDirection="column" gap={2}>
          <Button variant="contained" href="/employees">
            Employees
          </Button>
          <Button variant="outlined" href="/employees/new">
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
