import { useLoaderData, Form, redirect } from "react-router";
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
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import EmployeeForm from "~/components/EmployeeForm";

export async function loader({ params }: { params: { employeeId: string } }) {
  const db = await getDB();
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", [
    params.employeeId,
  ]);

  if (!employee) {
    throw new Response("Employee not found", { status: 404 });
  }

  return { employee };
}

export const action = async ({ request, params }: any) => {
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
    throw new Response("Date of birth is required.", { status: 400 });
  }

  const birthDate = new Date(date_of_birth);
  if (isNaN(birthDate.getTime())) {
    throw new Response("Invalid date format.", { status: 400 });
  }

  // Ensure Employee is at least 18 years old
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age < 18) {
    throw new Response("Employee must be at least 18 years old.", { status: 400 });
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
    "UPDATE employees SET full_name = ?, email = ?, phone = ?, date_of_birth = ?, job_title = ?, department = ?, salary = ?, start_date = ?, end_date = ?, photo_path = COALESCE(?, photo_path), document_path = COALESCE(?, document_path) WHERE id = ?",
    [
      full_name,
      email,
      phone,
      date_of_birth,
      job_title,
      department,
      salary,
      start_date,
      end_date,
      photoPath,
      documentPath,
      params.employeeId,
    ]
  );

  return redirect("/employees");
};

export default function EditEmployeePage() {
  const { employee } = useLoaderData();
  const navigate = useNavigate();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
            Edit Employee
            </Typography>
            <EmployeeForm initialData={employee} submitButtonLabel="Edit Employee" />
            <Box mt={3} display="flex" gap={2}>
              <Button variant="outlined" onClick={() => navigate("/employees")}>
                Employees
              </Button>
            </Box>
        </Paper>
      </Container>
  );
}
