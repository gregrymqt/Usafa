import React, { useState, useEffect, useCallback } from "react";
import styles from "./SlotManagement.module.scss";
import Swal from "sweetalert2";

import { SlotGenerationForm } from "./components/Form/SlotGenerationForm";
import { SlotListTable } from "./components/Table/SlotListTable";
import { slotService } from "./services/slot.service";
import type { Slot, SlotResponse, SlotStatus } from "./types/slot.types";

type TabType = "list" | "form";

function parseSlotStatus(statusRaw: string): SlotStatus {
  const upperStatus = statusRaw?.toUpperCase();
  const validStatuses: SlotStatus[] = [
    "DISPONIVEL",
    "AGENDADO",
    "BLOQUEADO",
    "FINALIZADO",
  ];

  if (validStatuses.includes(upperStatus as SlotStatus)) {
    return upperStatus as SlotStatus;
  }
  return "DISPONIVEL";
}

export const SlotManagementIndex: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("form");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentMedicoId, setCurrentMedicoId] = useState<string>("");

  const fetchSlots = useCallback(async () => {
    if (!currentMedicoId) return;

    setIsLoadingData(true);
    try {
      const response = await slotService.listarSlotsPorMedico(
        currentMedicoId,
      );

      const rawData = response as unknown as SlotResponse[];

      const data: Slot[] = rawData.map((item) => ({
        id: item.id,
        medicoId: item.medicoId ?? currentMedicoId,
        dataHoraInicio: item.dataHoraInicio,
        dataHoraFim: item.dataHoraFim,
        status: parseSlotStatus(item.status),
        valor: item.valor,
      }));

      setSlots(data);
    } catch (error) {
      console.error("Erro ao buscar slots", error);
      Swal.fire("Erro", "Não foi possível carregar a agenda.", "error");
    } finally {
      setIsLoadingData(false);
    }
  }, [currentMedicoId]);

  // Se o currentMedicoId mudar (via busca do filho) e a aba for lista, busca os dados
  useEffect(() => {
    if (activeTab === "list" && currentMedicoId) {
      fetchSlots();
    }
  }, [fetchSlots, activeTab, currentMedicoId]);

  const handleGenerationSuccess = (medicoIdUtilizado: string): void => {
    setCurrentMedicoId(medicoIdUtilizado);
    setActiveTab("list");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Gerenciamento de Agenda</h2>
        <p>Gere horários em lote ou visualize a disponibilidade atual.</p>
      </div>

      <div className={styles.tabsHeader}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "form" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("form")}
        >
          ➕ Gerar Horários
        </button>
        
        {/* CORREÇÃO: Botão sempre habilitado para permitir busca */}
        <button
          className={`${styles.tabButton} ${
            activeTab === "list" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("list")}
        >
          📅 Visualizar Agenda
        </button>
      </div>

      <div className={styles.contentArea}>
        {activeTab === "list" && (
          <div className={styles.tabContentFadeIn}>
            {/* Só mostra o cabeçalho se tiver ID selecionado */}
            {currentMedicoId && (
                <div className={styles.listHeader}>
                <h4>Agenda do Médico (ID: {currentMedicoId})</h4>
                <button onClick={fetchSlots} className={styles.refreshButton}>
                    Atualizar Lista
                </button>
                </div>
            )}

            <SlotListTable
                slots={slots}
                onRefresh={fetchSlots}
                // Quando o usuário buscar no filho, atualizamos o estado aqui
                // O useEffect vai perceber a mudança e chamar o fetchSlots automaticamente
                onSearch={setCurrentMedicoId} 
                isLoading={isLoadingData}
            />
          </div>
        )}

        {activeTab === "form" && (
          <div className={styles.tabContentFadeIn}>
            <SlotGenerationForm onSuccess={handleGenerationSuccess} />
          </div>
        )}
      </div>
    </div>
  );
};