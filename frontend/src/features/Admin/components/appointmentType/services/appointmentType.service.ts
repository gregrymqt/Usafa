// src/features/Admin/TipoConsulta/services/appointmentType.service.ts
import { api } from '../../../../../shared';
import { TipoConsulta } from '../types/appointmentType.type';

export const appointmentTypeService = {
  getAll: async (): Promise<TipoConsulta[]> => {
    return await api.get<TipoConsulta[]>('/tipos-consulta');
  },

  create: async (nome: string): Promise<void> => {
    return await api.post('/tipos-consulta', { nome });
  },

  update: async (publicId: string, nome: string): Promise<void> => {
    return await api.put(`/tipos-consulta/${publicId}`, { nome });
  },

  delete: async (publicId: string): Promise<void> => {
    return await api.delete(`/tipos-consulta/${publicId}`);
  }
};