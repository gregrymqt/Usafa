package br.edu.fatecpg.usafa.models.enums;

public enum StatusHorario {
    DISPONIVEL, // O slot está livre
    RESERVADO,  // Um usuário agendou (tem uma consulta ligada)
    BLOQUEADO   // O médico bloqueou (ex: almoço, férias)
}
