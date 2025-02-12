import { TextField, Grid, Typography, Box, Button, Container, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Paper } from "@mui/material";
import { Form, useNavigate, useActionData } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export type EmployeeFormData = {
    full_name: string;
    email: string;
    phone: number;
    date_of_birth?: string;
    job_title: string;
    department: string;
    salary: number;
    start_date: string;
    end_date?: string;
    photo_path?: string;
    document_path?: string;
};

type EmployeeFormProps = {
    initialData?: EmployeeFormData;
};

export default function EmployeeForm({ initialData }: EmployeeFormProps) {
    const navigate = useNavigate();
    const actionData = useActionData();
    const [openDialog, setOpenDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                setSuccessMessage(actionData.success);
                setOpenDialog(true);
                setErrorMessage(null);
                if (!initialData) {
                    formRef.current?.reset();
                }
            } else if (actionData.error) {
                setErrorMessage(actionData.error);
            }
        }
    }, [actionData]);


    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);

    if (!hydrated) return null;

    const isEditing = Boolean(initialData);
    const submitButtonLabel = isEditing ? "Edit Employee" : "Create Employee";
    const dialogTitle = isEditing ? "Employee Edited" : "Employee Created";

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    {isEditing ? "Edit Employee" : "Create New Employee"}
                </Typography>

                {errorMessage && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {errorMessage}
                    </Typography>
                )}
                <Form method="post" ref={formRef} encType="multipart/form-data">
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Full Name" name="full_name" defaultValue={initialData?.full_name || ""} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Email" name="email" type="email" defaultValue={initialData?.email || ""} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Phone" name="phone" type="number" defaultValue={initialData?.phone || ""} required fullWidth />
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
                                Add Document: {typeof initialData?.document_path === 'string' && initialData?.document_path !== '[object Object]' ? initialData.document_path.split("/").pop() : ''}
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
                <Box mt={3} display="flex" gap={2}>
                    <Button variant="outlined" onClick={() => navigate("/employees")}>
                        Employees
                    </Button>
                </Box>
            </Paper>

            {/* Success Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{successMessage}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenDialog(false);
                        setSuccessMessage(null); // Reset success message
                        if (!isEditing) {
                            formRef.current?.reset();
                        }
                        navigate("/employees")
                    }
                    }
                        variant="contained"
                        color="primary">
                        View Employees
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
