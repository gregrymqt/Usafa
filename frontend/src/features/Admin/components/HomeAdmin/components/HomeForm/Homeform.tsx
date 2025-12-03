import React, { useMemo, useCallback } from 'react';
import styles from './HomeForm.module.scss'; 
import AuthForm from "../../../../../../components/Form/AuthForm";
import { FormField } from "../../../../../../components/Form/types/form.type";
import { CONTENT_TYPES, HomeContent } from "../../types/homeAdmin.type";
import { useHomeForm } from "../../hooks/useHomeForm"; // Ajuste o caminho se necessário

interface HomeFormProps {
  // initialData: Pode ser nulo (criação) ou o objeto completo (edição)
  initialData?: HomeContent | null; 
  
  // onSubmit: Recebe o estado do form. Usamos Partial pois o hook constrói o objeto aos poucos.
  onSubmit: (data: Partial<HomeContent>) => void; 
  
  onCancel: () => void;
  isLoading?: boolean;
}

const HomeForm: React.FC<HomeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const {
    formData,
    previewUrl,
    handleInputChange,
    handleFileChange, 
    handleSubmit
  } = useHomeForm({ initialData, onSubmit });

  // --- ADAPTERS (Corrigidos com useCallback e Tipagem) ---
  
  const onTextChange = useCallback((name: string, value: string | number) => {
    // Simulamos um evento compatível com o esperado pelo hook
    const fakeEvent = {
      target: { name, value, type: 'text' }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(fakeEvent);
  }, [handleInputChange]);

  const onCheckChange = useCallback((name: string, checked: boolean) => {
    const fakeEvent = {
      target: { name, value: String(checked), type: 'checkbox', checked }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(fakeEvent);
  }, [handleInputChange]);

  const onFileSelect = useCallback((file: File | null) => {
    const fakeEvent = {
      target: { files: file ? [file] : null }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleFileChange(fakeEvent);
  }, [handleFileChange]);

  // --- DEFINIÇÃO DOS CAMPOS ---
  const fields: FormField[] = useMemo(() => [
    {
      elementType: 'select',
      name: 'type',
      label: 'Tipo de Conteúdo',
      // CORREÇÃO TS 2322: Garante string vazia se for undefined
      value: formData.type || "", 
      options: CONTENT_TYPES || [],
      required: true,
      onChange: (val) => onTextChange('type', val),
    },
    {
      elementType: 'file',
      name: 'image',
      label: 'Imagem (Banner/Destaque)',
      accept: 'image/*',
      onChange: (file) => onFileSelect(file),
      previewUrl: previewUrl, 
      placeholder: 'Clique para fazer upload da imagem',
    },
    {
      elementType: 'input',
      type: 'text',
      name: 'title',
      label: 'Título',
      placeholder: 'Ex: Promoção de Verão',
      value: formData.title || "",
      required: true,
      onChange: (val) => onTextChange('title', val),
    },
    {
      elementType: 'textarea',
      name: 'description',
      label: 'Descrição',
      placeholder: 'Texto descritivo...',
      value: formData.description || "",
      onChange: (val) => onTextChange('description', val),
    },
    {
      elementType: 'checkbox',
      name: 'isActive',
      label: 'Visível no Site?',
      value: !!formData.isActive,
      onChange: (checked) => onCheckChange('isActive', checked),
    }
  ], [formData, previewUrl, onTextChange, onCheckChange, onFileSelect]); // Dependências corretas

  return (
    <div className={styles.wrapper}> 
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={!!isLoading}
        buttonText={initialData ? "Atualizar" : "Criar"}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={styles.cancelButton}
          style={{ marginTop: '10px', width: '100%', padding: '10px', background: '#e0e0e0', border: 'none', cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </AuthForm>
    </div>
  );
};

export default HomeForm;