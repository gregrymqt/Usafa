import React, { useState } from 'react';
import styles from './SlotGenerationForm.module.scss';
import Swal from 'sweetalert2';
import { useSlotManagement } from '../../hooks/useSlotManagement';

interface SlotGenerationFormProps {
  onSuccess: (medicoId: string) => void; 
}

// Interface local para o estado do formulário
interface FormDataState {
  medicoId: string;
  inicio: string;
  fim: string;
  duracao: string; // string pois vem do <select> ou <input>
}

export const SlotGenerationForm: React.FC<SlotGenerationFormProps> = ({ onSuccess }) => {
  const { generateAgenda, isLoading, error, clearError } = useSlotManagement();
  
  const [formData, setFormData] = useState<FormDataState>({
    medicoId: '', 
    inicio: '',
    fim: '',
    duracao: '30'
  });

  // Tipagem correta do evento de mudança
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Tipagem correta do submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.medicoId) {
      Swal.fire('Atenção', 'Informe o ID do médico.', 'warning');
      return;
    }
    if (!formData.inicio || !formData.fim) {
      Swal.fire('Atenção', 'Preencha as datas de início e fim.', 'warning');
      return;
    }

    const success = await generateAgenda({
      medicoId: formData.medicoId,
      inicio: formData.inicio, 
      fim: formData.fim,
      duracaoMinutos: Number(formData.duracao), // Conversão explícita
    });

    if (success) {
      Swal.fire('Sucesso', 'Agenda gerada com sucesso!', 'success');
      onSuccess(formData.medicoId); 
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>Gerar Disponibilidade (Lote)</h3>
      {error && (
        <div className={styles.errorAlert}>
          {error} 
          <button onClick={clearError} className={styles.closeButton}>&times;</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.formGrid}>
        <div className={styles.inputGroup}>
            <label htmlFor="medicoId">ID do Médico</label>
            <input 
              type="text" 
              name="medicoId" 
              value={formData.medicoId} 
              onChange={handleChange} 
              required
              className={styles.input}
            />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="inicio">Início</label>
          <input 
            type="datetime-local" 
            name="inicio" 
            value={formData.inicio} 
            onChange={handleChange} 
            required
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="fim">Fim</label>
          <input 
            type="datetime-local" 
            name="fim" 
            value={formData.fim} 
            onChange={handleChange} 
            required 
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="duracao">Duração (min)</label>
          <select 
            name="duracao" 
            value={formData.duracao} 
            onChange={handleChange}
            className={styles.select}
          >
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">60 min</option>
          </select>
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={isLoading} className={styles.submitButton}>
            {isLoading ? 'Gerando...' : 'Gerar Agenda'}
          </button>
        </div>
      </form>
    </div>
  );
};