import { Form, redirect, type ActionFunction } from "react-router";
import { getDB } from "~/db/getDB";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const full_name = formData.get("full_name");

  const db = await getDB();
  await db.run(
    'INSERT INTO employees (full_name) VALUES (?)',
    [full_name]
  );

  return redirect("/employees");
}

export default function NewEmployeePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create New Employee
        </Typography>
        <Form method="post">
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Full Name"
              name="full_name"
              id="full_name"
              required
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary">
              Create Employee
            </Button>
          </Box>
        </Form>
      </Paper>

      <Box mt={2} display="flex" gap={2}>
        <Button variant="outlined" onClick={() => navigate("/employees")}>
          Employees
        </Button>
        <Button variant="outlined" onClick={() => navigate("/timesheets")}>
          Timesheets
        </Button>
      </Box>
    </Container>
  );
}
