import { useLoaderData, useActionData } from "react-router";
import EmployeeForm from "~/components/EmployeeForm";
import { handleEmployeeData } from "~/utilities/handle_employee";
import { type ActionFunction } from "react-router";
import { getDB } from "~/db/getDB";

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

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const employeeId = params.employeeId;
  return handleEmployeeData(formData, false, employeeId);
};

export default function EditEmployeePage() {
  const { employee } = useLoaderData();
  return <EmployeeForm initialData={employee} />;
}
