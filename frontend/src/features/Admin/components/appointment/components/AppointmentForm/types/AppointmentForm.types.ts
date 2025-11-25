import type { SlotOption } from "../../../../../../../components/Form/types/form.type";
import type { AppointmentFormData, FormSelectOption } from "../../../types/appointment.type";

export interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: AppointmentFormData | null;
  isLoading: boolean;
  patientOptions: FormSelectOption[];
  
  // --- ADICIONE ESTA LINHA ---
  typeOptions: FormSelectOption[]; 
  // ---------------------------

  slotOptions: SlotOption[]; 
}