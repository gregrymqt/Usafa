export interface FormSelectOption {
  value: string | number;
  label: string;
}

// Interface Base (propriedades comuns a todos)
interface BaseField {
  name: string;
  label: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}

// Tipo para Inputs de texto, email, senha, cep, etc.
export interface InputField extends BaseField {
  elementType: 'input';
  type: string; // 'text', 'email', 'password', 'tel'
  placeholder: string;
  value: string; // <-- Agora é SÓ string
  onChange: (value: string) => void; // <-- Agora é SÓ (value: string)
}

// Tipo para Textarea
export interface TextareaField extends BaseField {
  elementType: 'textarea';
  placeholder: string;
  value: string; // <-- SÓ string
  onChange: (value: string) => void; // <-- SÓ (value: string)
}

// Tipo para Select
export interface SelectField extends BaseField {
  elementType: 'select';
  value: string | number; // <-- Pode ser string ou number
  onChange: (value: string | number) => void;
  options: FormSelectOption[];
}

// Tipo para Checkbox
export interface CheckboxField extends BaseField {
  elementType: 'checkbox';
  value: boolean; // <-- Agora é SÓ boolean
  onChange: (value: boolean) => void; // <-- Agora é SÓ (value: boolean)
}

// O FormField agora é uma "União" de todos os tipos acima
export type FormField = InputField | TextareaField | SelectField | CheckboxField;

// --- FIM DAS DEFINIÇÕES DE TIPO ---


export interface AuthFormProps {
  fields: FormField[];
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  buttonText: string;
  children?: React.ReactNode;
}