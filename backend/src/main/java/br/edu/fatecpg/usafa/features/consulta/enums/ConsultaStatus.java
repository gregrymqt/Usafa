package br.edu.fatecpg.usafa.features.consulta.enums;

public enum ConsultaStatus {
    PENDENTE,
    CONFIRMADA,
    REALIZADA, // Pode ser usada como "Finalizada" se o front mandar "REALIZADA"
    FINALIZADA, // Adicionei esta para corrigir o erro do seu log
    CANCELADA   // Importante ter caso o admin queira cancelar
}
