import fs from 'fs';
import path from 'path';
import { getDB } from "~/db/getDB";

function calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
    }
    return age;
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

interface EmployeeData {
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    job_title: string;
    department: string;
    salary: string;
    start_date: string;
    end_date: string | null;
    photo?: File;
    document?: File;
}

export async function handleEmployeeData(
    formData: FormData,
    isNewEmployee: boolean,
    employeeId?: string
): Promise<Response> {
    try {
        const full_name = formData.get('full_name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const date_of_birth = formData.get('date_of_birth') as string | null;
        const job_title = formData.get('job_title') as string;
        const department = formData.get('department') as string;
        const salary = formData.get('salary') as string;
        const start_date = formData.get('start_date') as string;
        const end_date = formData.get('end_date') as string | null;

        if (!date_of_birth) {
            return new Response(
                JSON.stringify({ error: 'Date of birth is required.' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        const birthDate = new Date(date_of_birth);
        if (isNaN(birthDate.getTime())) {
            return new Response(
                JSON.stringify({ error: 'Invalid date format.' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        if (!isValidEmail(email)) {
            return new Response(
                JSON.stringify({ error: 'Invalid email address.' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        const age = calculateAge(birthDate);
        if (age < 18) {
            return new Response(
                JSON.stringify({ error: 'Employee must be at least 18 years old.' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
        const salaryAmount = parseFloat(salary);

        const photo = formData.get('photo') as File;
        const document = formData.get('document') as File;
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        let photoPath = null;
        let documentPath = null;

        if (photo && photo.size > 0) {
            const photoFilePath = path.join(
                uploadDir,
                `${email}_photo_${Date.now()}_${photo.name}`
            );
            const buffer = Buffer.from(await photo.arrayBuffer());
            fs.writeFileSync(photoFilePath, buffer);
            photoPath = `/uploads/${path.basename(photoFilePath)}`;
        }

        if (document && document.size > 0) {
            const docFilePath = path.join(
                uploadDir,
                `${email}_doc_${Date.now()}_${document.name}`
            );
            const buffer = Buffer.from(await document.arrayBuffer());
            fs.writeFileSync(docFilePath, buffer);
            documentPath = `/uploads/${path.basename(docFilePath)}`;
        }

        const db = await getDB();

        if (isNewEmployee) {
            await db.run(
                'INSERT INTO employees (full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date, photo_path, document_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    full_name,
                    email,
                    phone,
                    date_of_birth,
                    job_title,
                    department,
                    salaryAmount,
                    start_date,
                    end_date,
                    photoPath,
                    documentPath,
                ]
            );
            return new Response(
                JSON.stringify({ success: `Employee ${full_name} successfully added!` }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        } else {
            await db.run(
                'UPDATE employees SET full_name = ?, email = ?, phone = ?, date_of_birth = ?, job_title = ?, department = ?, salary = ?, start_date = ?, end_date = ?, photo_path = COALESCE(?, photo_path), document_path = COALESCE(?, document_path) WHERE id = ?',
                [
                    full_name,
                    email,
                    phone,
                    date_of_birth,
                    job_title,
                    department,
                    salaryAmount,
                    start_date,
                    end_date,
                    photoPath,
                    documentPath,
                    employeeId,
                ]
            );
            return new Response(
                JSON.stringify({ success: `Employee ${full_name} successfully updated!` }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
    } catch (err) {
        console.error('Server error:', err);
        return new Response(
            JSON.stringify({
                error: err instanceof Error ? err.message : 'Unknown error occurred.',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
