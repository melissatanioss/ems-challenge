import { TextField, Grid, Typography, Box, Button } from "@mui/material";
import { Form } from "react-router-dom";

export type EmployeeFormData = {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  job_title: string;
  department: string;
  salary: string;
  start_date: string;
  end_date?: string;
  photo_path?: string;
  document_path?: string;
};

type EmployeeFormProps = {
  initialData?: EmployeeFormData;
  submitButtonLabel?: string;
};

export default function EmployeeForm({ initialData, submitButtonLabel = "Save Employee" }: EmployeeFormProps) {
   return (
    <Form method="post" encType="multipart/form-data">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="Full Name" name="full_name" defaultValue={initialData?.full_name || ""} required fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Email" name="email" type="email" defaultValue={initialData?.email || ""} required fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Phone" name="phone" type="tel" defaultValue={initialData?.phone || ""} required fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Date of Birth" name="date_of_birth" type="date" InputLabelProps={{ shrink: true }} defaultValue={initialData?.date_of_birth || ""} required fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Job Title" name="job_title" defaultValue={initialData?.job_title || ""} required fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Department" name="department" defaultValue={initialData?.department || ""} required fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Salary" name="salary" type="number" defaultValue={initialData?.salary || ""} required fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Start Date" name="start_date" type="date" InputLabelProps={{ shrink: true }} defaultValue={initialData?.start_date || ""} required fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="End Date" name="end_date" type="date" InputLabelProps={{ shrink: true }} defaultValue={initialData?.end_date || ""} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
        <Typography>
        Add Photo: {typeof initialData?.photo_path === 'string' && initialData.photo_path !== '[object Object]' ? initialData.photo_path.split('/').pop() : ''}
        </Typography>
        <input type="file" name="photo" accept="image/*" />
        </Grid>
        <Grid item xs={12} sm={6}>
        <Typography>
            Add Document: {typeof initialData?.document_path === 'string' && initialData?.document_path !== '[object Object]' ? initialData.document_path.split("/").pop(): ''}
        </Typography>
        <input type="file" name="document" accept=".pdf,.doc,.docx" />
        </Grid>
      </Grid>
      <Box mt={3}>
        <Button type="submit" variant="contained" color="primary">
          {submitButtonLabel}
        </Button>
      </Box>
    </Form>
  );
}
