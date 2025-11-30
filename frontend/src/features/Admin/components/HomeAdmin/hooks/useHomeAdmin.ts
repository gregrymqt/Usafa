import { useState, useEffect, useCallback } from "react";
import { HomeContent } from "../types/homeAdmin.type";

interface UseHomeAdminProps {
  initialData?: HomeContent | null;
  onSubmit: (data: Partial<HomeContent>) => void;
}

export const useHomeAdmin = ({ initialData, onSubmit }: UseHomeAdminProps) => {
  const [formData, setFormData] = useState<Partial<HomeContent>>({
    type: "CAROUSEL_MAIN",
    title: "",
    description: "",
    isActive: true,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreviewUrl(initialData.imageUrl || null);
    } else {
      // Reseta o formulário para o estado inicial se não houver dados (modo de criação)
      setFormData({
        type: "CAROUSEL_MAIN",
        title: "",
        description: "",
        isActive: true,
      });
      setPreviewUrl(null);
    }
  }, [initialData]);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value, type } = e.target;
      // Se for checkbox, pega 'checked', senão pega 'value'
      const finalValue =
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

      setFormData((prev) => ({ ...prev, [name]: finalValue }));
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type) return;
    onSubmit(formData);
  };

  return {
    formData,
    previewUrl,
    handleInputChange,
    handleFileChange,
    handleSubmit,
  };
};
