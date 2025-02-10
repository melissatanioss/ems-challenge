import { useEffect, useState } from "react";
import { CssBaseline } from "@mui/material";
import { Form, type ActionFunction } from "react-router";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { getDB } from "~/db/getDB";
import path from "path";
import fs from "fs";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export const action: ActionFunction = async ({ request }) => {
    try {
    const formData = await request.formData();
    const full_name = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const date_of_birth = formData.get("date_of_birth") as string | null;
    const job_title = formData.get("job_title") as string;
    const department = formData.get("department") as string;
    const salary = formData.get("salary") as string;
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string | null;

    if (!date_of_birth) {
      return new Response(JSON.stringify({ error: "Date of birth is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const photo = formData.get("photo") as File;
    const document = formData.get("document") as File;
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let photoPath = null;
    let documentPath = null;

    if (photo && photo.size > 0) {
      const photoFilePath = path.join(uploadDir, `${full_name}_${Date.now()}_${photo.name}`);
      const buffer = Buffer.from(await photo.arrayBuffer());
      fs.writeFileSync(photoFilePath, buffer);
      photoPath = `/uploads/${path.basename(photoFilePath)}`;
    }

    if (document && document.size > 0) {
      const docFilePath = path.join(uploadDir, `${full_name}_${Date.now()}_${document.name}`);
      const buffer = Buffer.from(await document.arrayBuffer());
      fs.writeFileSync(docFilePath, buffer);
      documentPath = `/uploads/${path.basename(docFilePath)}`;
    }

    const db = await getDB();
    await db.run(
      "INSERT INTO employees (full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date, photo_path, document_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date, photoPath, documentPath]
    );

    return new Response(JSON.stringify({ success: "Employee successfully added!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Database insert failed. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};


export default function NewEmployeePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [successEmployee, setSuccessEmployee] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration issue by setting state only after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
      });

      const result = await response.json(); // Parse JSON response

      if (!response.ok) {
        throw new Error(result.error || "Unknown server error");
      }

      setSuccessEmployee(formData.get("full_name") as string);
      setOpenDialog(true);
      
      // Delay navigation to ensure dialog is shown
      setTimeout(() => navigate("/employees"), 1500);

    } catch (error) {
      console.error("Error submitting form:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      {mounted && (
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Create New Employee
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Form method="post" encType="multipart/form-data" action="/employees/new" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
                {/* Personal Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField label="Full Name" name="full_name" defaultValue={formData.full_name || ""} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email" name="email" type="email" defaultValue={formData.email || ""} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Phone" name="phone" type="tel" defaultValue={formData.phone || ""} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Date of Birth" name="date_of_birth" type="date" InputLabelProps={{ shrink: true }} defaultValue={formData.date_of_birth || ""} required fullWidth />
                </Grid>

                {/* Professional Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField label="Job Title" name="job_title" defaultValue={formData.job_title || ""} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Department" name="department" defaultValue={formData.department || ""} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Salary" name="salary" type="number" defaultValue={formData.salary || ""} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Start Date" name="start_date" type="date" InputLabelProps={{ shrink: true }} defaultValue={formData.start_date || ""} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="End Date" name="end_date" type="date" InputLabelProps={{ shrink: true }} defaultValue={formData.end_date || ""} fullWidth />
                </Grid>
                
                {/* File Upload Fields */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">Upload Profile Photo:</Typography>
                  <input type="file" name="photo" accept="image/*" />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">Upload Document (PDF, DOCX):</Typography>
                  <input type="file" name="document" accept=".pdf,.doc,.docx" />
                </Grid>
              </Grid>

              <Box mt={3} display="flex" gap={2}>
                <Button type="submit" variant="contained" color="primary">
                  Create Employee
                </Button>
                <Button variant="outlined" onClick={() => navigate("/employees")}>
                  Employees
                </Button>
              </Box>
            </Form>
          </Paper>

          {/* Success Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Employee Created</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Employee <strong>{successEmployee}</strong> was successfully created!
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button onClick={() => navigate("/employees")} variant="contained" color="primary">
                View Employees
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      )}
    </ThemeProvider>
  );
}
