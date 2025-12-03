import type { AppointmentFormData, FormSelectOption } from "../../../types/appointment.type";

export interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: AppointmentFormData | null;
  isLoading: boolean;
  
  // REMOVI patientOptions (não precisamos mais carregar lista de pacientes)
  patientOptions: FormSelectOption[];
  typeOptions: FormSelectOption[]; // Lista de especialidades
  slotOptions: FormSelectOption[]; // Lista de horários filtrados
  onTypeChange: (tipoId: string) => void; // Função para buscar os slots (vinda do hook)
}