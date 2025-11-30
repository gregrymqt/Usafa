import React, { useState, useMemo } from 'react';
import AuthForm from '../../../../../components/Form/AuthForm';
import type { FormField } from '../../../../../components/Form/types/form.type';
import type { NewDoctorData, Doctor } from '../types/doctor.type';
import styles from './DoctorForm.module.scss';

interface DoctorFormProps {
  onSubmit: (data: NewDoctorData) => Promise<void>;
  onCancel: () => void;
  initialData?: Doctor | null;
  isLoading: boolean;
}

export const DoctorForm: React.FC<DoctorFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null,
  isLoading,
}) => {
  // Estados dos campos de texto
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [crm, setCrm] = useState(initialData?.crm || '');
  const [specialty, setSpecialty] = useState(initialData?.specialty || 'Clínico Geral');

  // Estados do arquivo de imagem
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState(initialData?.picture || '');

  // Handler para seleção do arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handler de envio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Monta o objeto final combinando texto e arquivo
    const doctorData: NewDoctorData = { 
      name, 
      email, 
      crm, 
      specialty, 
      imageFile // O arquivo vai aqui
    };
    
    try {
      await onSubmit(doctorData);
    } catch (error) {
      console.error("Erro no formulário:", error);
    }
  };

  // Definição dos campos de texto para o AuthForm
  const fields: FormField[] = useMemo(
    () => [
      {
        elementType: 'input',
        type: 'text',
        name: 'name',
        label: 'Nome Completo',
        placeholder: 'Dr. Nome Sobrenome',
        value: name,
        onChange: (val) => setName(val as string),
        required: true,
      },
      {
        elementType: 'input',
        type: 'email',
        name: 'email',
        label: 'Email',
        placeholder: 'email@dominio.com',
        value: email,
        onChange: (val) => setEmail(val as string),
        required: true,
      },
      {
        elementType: 'input',
        type: 'text',
        name: 'crm',
        label: 'CRM',
        placeholder: 'CRM/SP 123456',
        value: crm,
        onChange: (val) => setCrm(val as string),
        required: true,
      },
      // REMOVIDO: O campo de texto 'picture'. Agora usamos o input file abaixo.
      {
        elementType: 'select',
        name: 'specialty',
        label: 'Especialidade',
        value: specialty,
        onChange: (val) => setSpecialty(val as string),
        options: [
          { value: 'Clínico Geral', label: 'Clínico Geral' },
          { value: 'Cardiologia', label: 'Cardiologia' },
          { value: 'Dermatologia', label: 'Dermatologia' },
          { value: 'Ortopedia', label: 'Ortopedia' },
        ],
      },
    ],
    [name, email, crm, specialty] // Removida a dependência 'picture' que quebrava o código
  );

  return (
    <div className={styles.doctorForm}>
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText={initialData ? 'Atualizar' : 'Criar'}
      >
        {/* Input de Arquivo Personalizado (Inserido como filho do AuthForm) */}
        <div className={styles.fileInputContainer} style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Foto de Perfil</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className={styles.fileInput} 
            />
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }} 
              />
            )}
          </div>
        </div>

        {/* Botão Cancelar */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={styles.cancelButton}
          style={{ marginTop: '1rem', width: '100%', padding: '0.75rem' }} // Estilo inline rápido, mova para scss
        >
          Cancelar
        </button>
      </AuthForm>
    </div>
  );
};