import EmployeeForm from "~/components/EmployeeForm";
import { type ActionFunction } from "react-router";
import { handleEmployeeData } from "~/utilities/handle_employee";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  return handleEmployeeData(formData, true);
};

export default function NewEmployeePage() {
  return <EmployeeForm />;
}

