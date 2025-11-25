import React, { useState, useEffect } from 'react';
import  { Modal } from '../../../../../../../components/Modal/Modal';
import type { ConsultaEditModalProps, ConsultaUpdateData } from './types/ConsultaEditModal.type';
import styles from './ConsultaEditModal.module.scss';

export const ConsultaEditModal: React.FC<ConsultaEditModalProps> = ({
  isOpen,
  onClose,
  request,
  onSubmit,
}) => {
  // Estado interno do formulário
  const [formData, setFormData] = useState<ConsultaUpdateData>({
    status: '',
    dia: '',
    horario: '',
  });

  // Quando 'request' (a consulta) muda, atualiza o formulário
  useEffect(() => {
    if (request) {
      setFormData({
        status: request.status,
        dia: request.dia,
        horario: request.horario,
      });
    }
  }, [request]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (request) {
      onSubmit(request.id, formData);
      onClose(); // Fecha o modal após enviar
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Solicitação">
      {request && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.info}>
            <strong>Paciente:</strong> {request.nomePaciente} <br />
            <strong>Médico:</strong> {request.nomeMedico}
          </div>
          
          {/* Campo Dia */}
          <div className={styles.formGroup}>
            <label htmlFor="dia">Data</label>
            <input
              type="date"
              id="dia"
              name="dia"
              value={formData.dia}
              onChange={handleChange}
              required
            />
          </div>

          {/* Campo Horário */}
          <div className={styles.formGroup}>
            <label htmlFor="horario">Horário</label>
            <input
              type="time"
              id="horario"
              name="horario"
              value={formData.horario}
              onChange={handleChange}
              required
            />
          </div>

          {/* Campo Status */}
          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="PENDENTE">Pendente</option>
              <option value="ACEITA">Aceita</option>
              <option value="RECUSADA">Recusada</option>
            </select>
          </div>

          {/* Botões */}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Salvar Alterações
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};