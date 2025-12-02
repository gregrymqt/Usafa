import React, { useState } from 'react';
import styles from './SlotGenerationForm.module.scss';
import Swal from 'sweetalert2';
import { useSlotManagement } from '../../hooks/useSlotManagement';

interface SlotGenerationFormProps {
  medicoId: string;
  onSuccess: () => void;
}

export const SlotGenerationForm: React.FC<SlotGenerationFormProps> = ({ medicoId, onSuccess }) => {
  const { generateAgenda, isLoading, error, clearError } = useSlotManagement();
  
  const [formData, setFormData] = useState({
    inicio: '',
    fim: '',
    duracao: 30, // Default 30 min
    valor: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de UX
    if (!formData.inicio || !formData.fim) {
      Swal.fire('Atenção', 'Preencha as datas de início e fim.', 'warning');
      return;
    }

    const success = await generateAgenda({
      medicoId,
      inicio: formData.inicio, 
      fim: formData.fim,
      duracaoMinutos: Number(formData.duracao),
    });

    if (success) {
      Swal.fire('Sucesso', 'Agenda gerada com sucesso!', 'success');
      onSuccess(); 
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>Gerar Disponibilidade (Lote)</h3>
      <p className={styles.subtitle}>Defina o intervalo de atendimento para criar os horários automaticamente.</p>

      {/* Exibe erro vindo do Backend (via hook) */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
          {error} 
          <button type="button" onClick={clearError} style={{ float: 'right', cursor: 'pointer', background: 'none', border: 'none', color: '#721c24', fontWeight: 'bold' }}>X</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.formGrid}>
        
        {/* Data Início (Data e Hora) */}
        <div className={styles.inputGroup}>
          <label htmlFor="inicio">Início do Plantão</label>
          <input 
            type="datetime-local" 
            id="inicio" 
            name="inicio" 
            value={formData.inicio} 
            onChange={handleChange} 
            required
            className={styles.input}
          />
        </div>

        {/* Data Fim (Data e Hora) */}
        <div className={styles.inputGroup}>
          <label htmlFor="fim">Fim do Plantão</label>
          <input 
            type="datetime-local" 
            id="fim" 
            name="fim" 
            value={formData.fim} 
            onChange={handleChange} 
            required 
            className={styles.input}
          />
        </div>

        {/* Duração */}
        <div className={styles.inputGroup}>
          <label htmlFor="duracao">Duração (minutos)</label>
          <select 
            name="duracao" 
            id="duracao" 
            value={formData.duracao} 
            onChange={handleChange}
            className={styles.select}
          >
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">1 hora</option>
          </select>
        </div>

        
        {/* Botão de Ação */}
        <div className={styles.actions}>
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Gerando...' : 'Gerar Agenda'}
          </button>
        </div>
      </form>
    </div>
  );
};