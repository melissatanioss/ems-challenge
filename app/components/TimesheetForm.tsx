import { TextField, Grid, Typography, Box, Button, Paper, FormControl, InputLabel, Select, MenuItem, Container, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions } from "@mui/material";
import { useNavigate, Form } from "react-router-dom";
import { useState, useEffect } from "react";

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
    defaultValues?: TimesheetData
    submitLabel: string
    error?: string | null
    success?: string | null
}


export default function TimesheetForm({ employees, defaultValues, submitLabel, error, success }: TimesheetFormProps) {
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = useState(!!success);

    useEffect(() => {
        if (success) setOpenDialog(true);
    }, [success]);

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    {submitLabel}
                </Typography>
                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}
                <Form method="post" encType="multipart/form-data">
                    <Box display="flex" flexDirection="column" gap={2}>
                        <InputLabel>Employee</InputLabel>
                        <Select name="employee_id" defaultValue={defaultValues?.employee_id || ""} required>
                            {employees.map((employee) => (
                                <MenuItem key={employee.id} value={employee.id}>
                                    {employee.full_name}
                                </MenuItem>
                            ))}
                        </Select>
                        <TextField
                            label="Start Time"
                            type="datetime-local"
                            name="start_time"
                            InputLabelProps={{ shrink: true }}
                            defaultValue={defaultValues?.start_time || ""}
                            required
                            fullWidth
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            label="End Time"
                            type="datetime-local"
                            name="end_time"
                            InputLabelProps={{ shrink: true }}
                            defaultValue={defaultValues?.end_time || ""}
                            required
                            fullWidth
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            label="Work Summary"
                            name="summary"
                            multiline
                            rows={3}
                            defaultValue={defaultValues?.summary || ""}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                    </Box>
                    <Box display="flex" gap={2}>
                        <Button type="submit" variant="contained" color="primary">
                            {submitLabel}
                        </Button>

                        {/* Show this button only in Edit Timesheet */}
                        {defaultValues?.employee_id && (
                            <Button variant="outlined" onClick={() => navigate(`/employees/${defaultValues.employee_id}`)}>
                                Current Employee
                            </Button>
                        )}

                        <Button variant="outlined" href="/timesheets">
                            Timesheets
                        </Button>
                        <Button variant="outlined" href="/employees">
                            Employees
                        </Button>
                    </Box>
                </Form>
            </Paper>
            
            {/* Success Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Timesheet Created</DialogTitle>
                <DialogContent>
                    <DialogContentText>{success}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Close</Button>
                    <Button href="/timesheets" variant="contained" color="primary">
                        View Timesheets
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}