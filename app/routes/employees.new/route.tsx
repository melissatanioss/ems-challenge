import { CssBaseline, Container, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate, useActionData } from "react-router-dom";
import EmployeeForm from "~/components/EmployeeForm";
import { getDB } from "~/db/getDB";
import { Form, type ActionFunction } from "react-router";
import path from "path";
import fs from "fs";
import { useState, useEffect } from "react";

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
    const photoFilePath = path.join(uploadDir, `${email}_photo_${Date.now()}_${photo.name}`);
    const buffer = Buffer.from(await photo.arrayBuffer());
    fs.writeFileSync(photoFilePath, buffer);
    photoPath = `/uploads/${path.basename(photoFilePath)}`;
  }

  if (document && document.size > 0) {
    const docFilePath = path.join(uploadDir, `${email}_doc_${Date.now()}_${document.name}`);
    const buffer = Buffer.from(await document.arrayBuffer());
    fs.writeFileSync(docFilePath, buffer);
    documentPath = `/uploads/${path.basename(docFilePath)}`;
  }

  const db = await getDB();
  await db.run(
    "INSERT INTO employees (full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date, photo_path, document_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date, photoPath, documentPath]
  );

  return new Response(JSON.stringify({ success: `Employee ${full_name} successfully added!` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

} catch (err) {
  console.error("Server error:", err);
  return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error occurred." }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}};

export default function NewEmployeePage() {
  const navigate = useNavigate();
  const actionData = useActionData();
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [successEmployee, setSuccessEmployee] = useState<string | null>(null);

  useEffect(() => {
    if (actionData?.success) {
      setSuccessEmployee(actionData.success);
      setOpenDialog(true);
    } else if (actionData?.error) {
      setError(actionData.error);
    }
  }, [actionData]);

    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
      setHydrated(true);
    }, []);
  
    if (!hydrated) return null; // Prevents hydration mismatch
  
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Create New Employee
          </Typography>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <EmployeeForm submitButtonLabel="Create Employee" />
          <Box mt={3} display="flex" gap={2}>
                <Button variant="outlined" onClick={() => navigate("/employees")}>
                  Employees
                </Button>
              </Box>
        </Paper>

        {/* Success Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Employee Created</DialogTitle>
          <DialogContent>
            <DialogContentText><strong>{successEmployee}</strong></DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => navigate("/employees")} variant="contained" color="primary">
              View Employees
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
