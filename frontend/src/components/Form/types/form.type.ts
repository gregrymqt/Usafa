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
  placeholder?: string;
}

// Tipo para Checkbox
export interface CheckboxField extends BaseField {
  elementType: 'checkbox';
  value: boolean; // <-- Agora é SÓ boolean
  onChange: (value: boolean) => void; // <-- Agora é SÓ (value: boolean)
}

export interface FileField extends BaseField {
  elementType: 'file';
  accept?: string;       // Ex: "image/*", ".pdf"
  onChange: (file: File | null) => void; // Retorna o Arquivo direto
  previewUrl?: string | null; // URL para mostrar a imagem prévia
  placeholder?: string; // Texto a ser exibido quando não houver prévia
}

export type FormField = 
  | InputField 
  | TextareaField 
  | SelectField 
  | CheckboxField 
  | FileField; // <--- Adicionado aqui


export interface AuthFormProps {
  fields: FormField[];
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  buttonText: string;
  children?: React.ReactNode;
}

export interface SlotOption extends FormSelectOption {
  date: string;
  time: string;
}