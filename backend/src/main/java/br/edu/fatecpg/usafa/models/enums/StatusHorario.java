package br.edu.fatecpg.usafa.models.enums;

public enum StatusHorario {
    DISPONIVEL, // Criado e livre para agendar
    AGENDADO,   // Já tem um paciente (não pode excluir direto)
    BLOQUEADO,  // Médico bloqueou (almoço, folga, etc)
    FINALIZADO, // Consulta já aconteceu
    CANCELADO   // Foi cancelado e o slot ficou "sujo" (opcional)
}
