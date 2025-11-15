import type { AppointmentFormData, FormSelectOption } from "../../../types/appointment.type";

export interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: AppointmentFormData | null;
  isLoading: boolean;
  // O formulário precisará das listas de médicos e pacientes
  // que serão carregadas pelo componente pai (AdminDashboard)
  doctorOptions: FormSelectOption[];
  patientOptions: FormSelectOption[];
}