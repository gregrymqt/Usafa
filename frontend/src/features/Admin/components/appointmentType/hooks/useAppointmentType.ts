// src/features/Admin/TipoConsulta/hooks/useAppointmentType.ts
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { appointmentTypeService } from "../services/appointmentType.service";
import { TipoConsulta } from "../types/appointmentType.type";
import { ApiError } from "../../../../../shared/exceptions/ApiError";
import { FormField } from "../../../../../components/Form/types/form.type";

export const useAppointmentType = () => {
  // --- Estados ---
  const [activeTab, setActiveTab] = useState<"list" | "form">("list");
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [tipos, setTipos] = useState<TipoConsulta[]>([]);
  const [editingItem, setEditingItem] = useState<TipoConsulta | null>(null);
  const [formData, setFormData] = useState({ nome: "" });

  // --- Ações ---

  const fetchTipos = useCallback(async () => {
    setIsLoadingTypes(true);
    try {
      const data = await appointmentTypeService.getAll();
      setTipos(data || []);
    } catch (error: unknown) {
      console.error(error);
      const mensagemDoBackend =
        error instanceof ApiError
          ? error.message
          : "Não foi possível carregar os tipos de consulta.";

      Swal.fire("Erro ao Carregar", mensagemDoBackend, "error");
    } finally {
      setIsLoadingTypes(false);
    }
  }, []);

  const handleDelete = async (publicId: string) => {
    setIsLoadingTypes(true);
    try {
      await appointmentTypeService.delete(publicId);
      await fetchTipos();
      Swal.fire("Sucesso", "Tipo de consulta excluído.", "success");
    } catch (error: unknown) {
      console.error(error);

      const mensagemDoBackend =
        error instanceof ApiError
          ? error.message
          : "Erro desconhecido ao deletar.";

      Swal.fire("Não foi possível deletar", mensagemDoBackend, "warning");
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const handleEditSetup = (item: TipoConsulta) => {
    setEditingItem(item);
    setFormData({ nome: item.nome });
    setActiveTab("form");
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData({ nome: "" });
    setActiveTab("list");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingTypes(true);

    try {
      if (editingItem) {
        await appointmentTypeService.update(
          editingItem.publicId,
          formData.nome
        );
        Swal.fire("Sucesso", "Tipo de consulta atualizado!", "success");
      } else {
        await appointmentTypeService.create(formData.nome);
        Swal.fire("Sucesso", "Tipo de consulta criado!", "success");
      }

      handleCancelEdit(); // Reseta e volta para lista
      fetchTipos();
    } catch (error: unknown) {
      console.error(error);
      const mensagemDoBackend =
        error instanceof ApiError
          ? error.message
          : "Ocorreu um erro ao salvar os dados.";

      Swal.fire("Erro ao Salvar", mensagemDoBackend, "error");
    } finally {
      setIsLoadingTypes(false);
    }
  };

  // --- Configurações ---

  // Definimos os campos do formulário aqui para limpar a View
  const formFields: FormField[] = [
    {
      name: "nome",
      label: "Nome da Especialidade",
      elementType: "input",
      type: "text",
      placeholder: "Ex: Cardiologia, Dermatologia...",
      required: true,
      value: formData.nome,
      onChange: (val) => setFormData((prev) => ({ ...prev, nome: val })),
    },
  ];

  // Inicialização
  useEffect(() => {
    fetchTipos();
  }, [fetchTipos]);

  return {
    // State
    activeTab,
    setActiveTab,
    isLoadingTypes,
    tipos,
    editingItem,

    // Actions
    handleDelete,
    handleEditSetup,
    handleCancelEdit,
    handleSubmit,

    // Configs
    formFields,
  };
};
