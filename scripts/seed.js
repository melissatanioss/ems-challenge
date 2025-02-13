import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfigPath = path.join(__dirname, '../database.yaml');
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, 'utf8'));

const {
  'sqlite_path': sqlitePath,
} = dbConfig;

const db = new sqlite3.Database(sqlitePath);

const employees = [
  {
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    date_of_birth: '1990-05-15',
    job_title: 'Software Engineer',
    department: 'Engineering',
    salary: 70000,
    start_date: '2022-06-01',
    end_date: null, 
    photo_path: null,
    document_path: null
  },
  {
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '9876543210',
    date_of_birth: '1985-08-25',
    job_title: 'Product Manager',
    department: 'Product',
    salary: 90000,
    start_date: '2021-09-10',
    end_date: null,
    photo_path: null,
    document_path: null
  },
  {
    full_name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '5556667777',
    date_of_birth: '1992-03-30',
    job_title: 'HR Manager',
    department: 'Human Resources',
    salary: 65000,
    start_date: '2020-04-15',
    end_date: null,
    photo_path: null,
    document_path: null
  },
  {
    full_name: 'Melissa',
    email: 'melissa@gmail.com',
    phone: '2983943109',
    date_of_birth: '1999-04-16',
    job_title: 'Software Developer',
    department: 'Engineering',
    salary: 2000,
    start_date: '2020-03-01',
    end_date: null,
    photo_path: null,
    document_path: null
  },
];

const timesheets = [
  {
    employee_id: 1,
    start_time: '2025-02-10 08:00:00',
    end_time: '2025-02-10 17:00:00',
    summary: 'out of office'
  },
  {
    employee_id: 2,
    start_time: '2025-02-11 12:00:00',
    end_time: '2025-02-11 17:00:00',
    summary: 'meeting'
  },
  {
    employee_id: 3,
    start_time: '2025-02-12 07:00:00',
    end_time: '2025-02-12 16:00:00',
  },
  {
    employee_id: 1,
    start_time: '2025-02-13 09:00:00',
    end_time: '2025-02-13 18:00:00',
    summary: 'Remote work'
  },
  {
    employee_id: 2,
    start_time: '2025-02-14 08:30:00',
    end_time: '2025-02-14 16:30:00',
    summary: 'Office work'
  },
  {
    employee_id: 3,
    start_time: '2025-02-15 10:00:00',
    end_time: '2025-02-15 15:00:00',
    summary: 'Training session'
  },
  {
    employee_id: 1,
    start_time: '2025-02-16 07:45:00',
    end_time: '2025-02-16 12:30:00',
    summary: 'Half-day shift'
  },
  {
    employee_id: 2,
    start_time: '2025-02-17 14:00:00',
    end_time: '2025-02-17 19:00:00',
    summary: 'Sick'
  },
  {
    employee_id: 3,
    start_time: '2025-02-18 08:00:00',
    end_time: '2025-02-18 17:00:00',
    summary: 'Regular shift'
  },
  {
    employee_id: 1,
    start_time: '2025-02-19 09:00:00',
    end_time: '2025-02-19 17:00:00',
    summary: 'Project work'
  },
  {
    employee_id: 4,
    start_time: '2025-02-19 09:00:00',
    end_time: '2025-02-28 17:00:00',
    summary: 'Your favorite candidate'
  }
];


const insertData = (table, data) => {
  const columns = Object.keys(data[0]).join(', ');
  const placeholders = Object.keys(data[0]).map(() => '?').join(', ');

  const insertStmt = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`);

  data.forEach(row => {
    insertStmt.run(Object.values(row));
  });

  insertStmt.finalize();
};

db.serialize(() => {
  insertData('employees', employees);
  insertData('timesheets', timesheets);
});

db.close(err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Database seeded successfully.');
  }
});

