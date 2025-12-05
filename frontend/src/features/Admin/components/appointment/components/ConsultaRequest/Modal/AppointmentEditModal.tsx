import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../../../../components/Modal/Modal';
import styles from './AppointmentEditModal.module.scss';
import { AppointmentAdminResponse, AppointmentOperation } from '../../../types/appointment.type';
// Imports Novos


export interface ConsultaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Recebe o DTO de Visualização (Admin)
  request: AppointmentAdminResponse | null; 
  // Envia o DTO de Operação
  onSubmit: (id: string, data: AppointmentOperation) => void; 
}

export const ConsultaEditModal: React.FC<ConsultaEditModalProps> = ({
  isOpen,
  onClose,
  request,
  onSubmit,
}) => {
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (request) {
      setStatus(request.status);
    }
  }, [request]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (request) {
      // Criamos o objeto Operation. Mantemos os IDs originais e mudamos o status.
      const operationData: AppointmentOperation = {
        patientId: request.pacienteId,
        horarioSlotId: request.horarioSlotId,
        tipoConsultaId: request.tipoConsultaId,
        sintomas: request.sintomas,
        status: status // O campo que estamos de fato mudando
      };
      
      onSubmit(request.id, operationData);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Solicitação">
      {request && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.info}>
            <strong>Paciente:</strong> {request.pacienteNome} <br />
            <strong>Médico:</strong> {request.medicoNome} <br />
            <strong>Data Solicitada:</strong> {request.data} às {request.horario}
          </div>

          {/* Edição Simples de Status */}
          <div className={styles.formGroup}>
            <label htmlFor="status">Alterar Status</label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PENDENTE">Pendente</option>
              <option value="ACEITA">Aceita (Confirmar)</option>
              <option value="RECUSADA">Recusada</option>
            </select>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Salvar
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};