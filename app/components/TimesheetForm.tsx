import { TextField, Grid, Typography, Box, Button, Paper, FormControl, InputLabel, Select, MenuItem, Container, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions } from "@mui/material";
import { useNavigate, useActionData } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export type TimesheetData = {
    id: number;
    start_time: string;
    end_time: string;
    summary: string | null;
    full_name: string;
    employee_id: number;
};

type TimesheetFormProps = {
    employees: { id: string; full_name: string }[];
    defaultValues?: TimesheetData;
    submitLabel: string;
};

function formatDateTime(datetime?: string): string {
    if (!datetime) return "";
    return new Date(datetime).toISOString().slice(0, 16);
  }

export default function TimesheetForm({ employees, defaultValues, submitLabel }: TimesheetFormProps) {
    const navigate = useNavigate();
    const actionData = useActionData();
    const formRef = useRef<HTMLFormElement>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                setSuccessMessage(actionData.success);
                setErrorMessage(null);
                setOpenDialog(true);

                // Reset form only for new timesheets
                if (!defaultValues) {
                    formRef.current?.reset();
                }
            } else if (actionData.error) {
                setErrorMessage(actionData.error);
            }
        }
    }, [actionData]);

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    {submitLabel}
                </Typography>
                {errorMessage && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {errorMessage}
                    </Typography>
                )}
                <form ref={formRef} method="post">
                    <Box display="flex" flexDirection="column" gap={2}>
                        <FormControl fullWidth required>
                            <InputLabel>Employee</InputLabel>
                            <Select name="employee_id" defaultValue={defaultValues?.employee_id ?? ""}>
                                {employees.map((employee) => (
                                    <MenuItem key={employee.id} value={employee.id}>
                                        {employee.full_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Start Time"
                            type="datetime-local"
                            name="start_time"
                            InputLabelProps={{ shrink: true }}
                            defaultValue={formatDateTime(defaultValues?.start_time)}
                            required
                            fullWidth
                        />

                        <TextField
                            label="End Time"
                            type="datetime-local"
                            name="end_time"
                            InputLabelProps={{ shrink: true }}
                            defaultValue={formatDateTime(defaultValues?.end_time)}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Work Summary"
                            name="summary"
                            multiline
                            rows={3}
                            defaultValue={defaultValues?.summary || ""}
                            fullWidth
                        />
                    </Box>
                    <Box display="flex" gap={2} mt={3}>
                        <Button type="submit" variant="contained" color="primary">
                            {submitLabel}
                        </Button>
                        <Button variant="outlined" onClick={() => navigate("/timesheets")}>
                            View Timesheets
                        </Button>
                        <Button variant="outlined" onClick={() => navigate("/employees")}>
                            View Employees
                        </Button>
                        {defaultValues && (
                            <Button variant="outlined" onClick={() => navigate(`/employees/${defaultValues.employee_id}`)}>
                                Current Employee
                            </Button>
                        )}
                    </Box>
                </form>
            </Paper>

            {/* Success Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Timesheet {defaultValues ? "Updated" : "Created"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{successMessage}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Close</Button>
                    <Button
                        onClick={() => navigate("/timesheets")}
                        variant="contained"
                        color="primary"
                    >
                        View Timesheets
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
