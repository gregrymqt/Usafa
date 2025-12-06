import { api } from "../../../../../shared";
import { HomeContent } from "../types/homeAdmin.type";

// URL base específica para o conteúdo da home
const ENDPOINT = "/home/content";

export const homeService = {
  // GET: Aberto a todos (conforme sua regra)
  getPublic: async (): Promise<HomeContent[]> => {
    return api.get<HomeContent[]>(`${ENDPOINT}/public`);
  },

  // Para o painel administrativo (vê inativos também)
  getAllAdmin: async (): Promise<HomeContent[]> => {
    return api.get<HomeContent[]>(`${ENDPOINT}/admin`);
  },

  // CREATE: Envia Imagem + Dados
  create: async (data: Omit<HomeContent, "id">): Promise<HomeContent> => {
    const formData = new FormData();

    // Anexamos os campos de texto
    formData.append("type", data.type);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("isActive", String(data.isActive));

    // Se houver arquivo, anexamos. O backend deve esperar "file" ou "image"
    if (data.imageFile) {
      formData.append("file", data.imageFile);
    }

    // Usamos o método específico para FormData que criamos acima
    return api.postFormData<HomeContent>(ENDPOINT, formData);
  },

  // UPDATE: Similar ao Create, mas com PUT
  update: async (
    id: number | string,
    data: Partial<HomeContent>
  ): Promise<HomeContent> => {
    const formData = new FormData();

    if (data.type !== undefined) formData.append("type", data.type);
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
    if (data.imageFile) formData.append("file", data.imageFile);
    

    return api.putFormData<HomeContent>(`${ENDPOINT}/${id}`, formData);
  },

  // DELETE
  delete: async (id: number | string): Promise<void> => {
    return api.delete(`${ENDPOINT}/${id}`);
  },
};
