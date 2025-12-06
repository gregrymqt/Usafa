package br.edu.fatecpg.usafa.features.admin.services.timeSlot;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.AtualizarSlotDTO;
import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.GerarAgendaDTO;
import br.edu.fatecpg.usafa.features.admin.interfaces.timeSlot.IHorarioSlotService;
import br.edu.fatecpg.usafa.features.admin.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.features.admin.utils.doctor.DoctorHelper;
import br.edu.fatecpg.usafa.features.admin.utils.timeSlot.HorarioSlotHelper;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.enums.StatusHorario;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class HorarioSlotServiceImpl implements IHorarioSlotService {

    private final IHorarioSlotRepository slotRepository;
    private final DoctorHelper helperService; // Usa seu helper existente para buscar Médico
    private final HorarioSlotHelper slotHelper; // Usa o novo helper para validar datas
    private final ICacheService cacheService;

    private static final String CACHE_PREFIX = "agenda:slots:";

    @Override
    @Transactional
    public void gerarAgenda(GerarAgendaDTO dados) {
        log.info("--- INICIANDO GERAÇÃO DE AGENDA ---");
        log.info("Médico PublicID: {}", dados.medicoId());
        
        slotHelper.validarIntervaloTempo(dados.inicio(), dados.fim(), dados.duracaoMinutos());
        
        Medico medico = helperService.findDoctorByPublicId(dados.medicoId());
        log.info("Médico recuperado: {} (ID: {})", medico.getNome(), medico.getId());

        LocalDateTime cursor = dados.inicio();
        int slotsCriados = 0;

        while (cursor.plusMinutes(dados.duracaoMinutos()).isBefore(dados.fim()) ||
                cursor.plusMinutes(dados.duracaoMinutos()).isEqual(dados.fim())) {

            LocalDateTime fimSlot = cursor.plusMinutes(dados.duracaoMinutos());
            
            // Log de verificação de colisão (pode comentar depois se poluir muito)
            // log.debug("Verificando colisão para: {}", cursor);

            boolean existeSlot = slotRepository
                    .findByMedicoPublicIdAndDataHoraInicio(dados.medicoId(), cursor)
                    .isPresent();

            if (!existeSlot) {
                HorarioSlot slot = new HorarioSlot(medico, cursor, fimSlot);
                slotRepository.save(slot);
                slotsCriados++;
            }
            cursor = cursor.plusMinutes(dados.duracaoMinutos());
        }

        if (slotsCriados > 0) {
            log.info("Sucesso! Total de slots criados: {}", slotsCriados);
            // INVALIDA O CACHE DO MÉDICO POIS A AGENDA MUDOU
            limparCacheDoMedico(dados.medicoId()); 
        } else {
            log.warn("Nenhum slot criado (provavelmente já existiam ou horário inválido).");
        }
    }

    @Override
    @Transactional
    public void atualizarSlot(Long idSlot, AtualizarSlotDTO dados) {
        HorarioSlot slot = buscarSlotPorId(idSlot);

        // REGRA: Não altera slot se já tiver consulta marcada
        if (slot.getStatus() == StatusHorario.AGENDADO || slot.getStatus() == StatusHorario.FINALIZADO) {
            throw new BusinessRuleException("Não é possível alterar um horário que já possui agendamento.");
        }

        if (dados.novoStatus() != null) {
            // Impede que o admin force "AGENDADO" manualmente sem passar pelo fluxo de
            // consulta
            if (dados.novoStatus() == StatusHorario.AGENDADO) {
                throw new BusinessRuleException("Para agendar, utilize o fluxo de criar Consulta.");
            }
            slot.setStatus(dados.novoStatus());
        }

        log.info("Slot ID {} atualizado.", idSlot);
        
        // INVALIDA O CACHE (Precisamos do PublicID do médico para limpar a chave certa)
        limparCacheDoMedico(slot.getMedico().getPublicId().toString());
    }

    @Override
    @Transactional
    public void excluirSlot(Long idSlot) {
        HorarioSlot slot = buscarSlotPorId(idSlot);

        // REGRA: Não deleta slot com agendamento. O correto é cancelar a consulta
        // antes.
        if (slot.getStatus() != StatusHorario.DISPONIVEL && slot.getStatus() != StatusHorario.BLOQUEADO) {
            throw new BusinessRuleException("Este horário possui um agendamento ativo e não pode ser excluído.");
        }

        String medicoPublicId = slot.getMedico().getPublicId().toString();
        slotRepository.delete(slot);
        log.info("Slot ID {} excluído.", idSlot);
        
        // INVALIDA O CACHE
        limparCacheDoMedico(medicoPublicId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HorarioSlot> listarSlotsPorMedico(String medicoPublicId, String dataOpcional) {
        // 0. Tratamento básico de entrada
        String publicIdLimpo = medicoPublicId != null ? medicoPublicId.trim() : "";
        
        log.info("--- LISTANDO SLOTS ---");
        log.info("1. PublicID recebido: '{}'", publicIdLimpo);
        log.info("2. Filtro de Data: '{}'", dataOpcional);

        // 1. TENTA PEGAR DO CACHE PRIMEIRO
        // Chave ex: "agenda:slots:uuid-do-medico:2025-12-05" ou "agenda:slots:uuid-do-medico:todos"
        String cacheKey = CACHE_PREFIX + publicIdLimpo + ":" + (dataOpcional != null ? dataOpcional : "todos");
        
        // Nota: O ideal é cachear DTOs, mas se for cachear Entidade, garanta que não há Lazy Loading pendente.
        // Aqui assumimos que HorarioSlot é simples o suficiente ou que o CacheService lida com JSON.
        try {
             HorarioSlot[] cachedSlots = cacheService.get(cacheKey, HorarioSlot[].class);
             if (cachedSlots != null) {
                 log.info("3. CACHE HIT! Retornando {} slots da memória.", cachedSlots.length);
                 return Arrays.asList(cachedSlots);
             }
        } catch (Exception e) {
            log.warn("Erro ao ler cache (ignorado para buscar no banco): {}", e.getMessage());
        }

        log.info("4. CACHE MISS. Buscando no Banco de Dados...");

        // 2. BUSCA O MÉDICO (Isso valida se o ID existe)
        Medico medico = helperService.findDoctorByPublicId(publicIdLimpo);
        Long medicoIdPK = medico.getId();
        
        log.info("5. Médico encontrado: Nome='{}', ID Interno={}", medico.getNome(), medicoIdPK);

        List<HorarioSlot> slotsEncontrados;

        // 3. LÓGICA DE BUSCA
        if (dataOpcional != null && !dataOpcional.isEmpty()) {
            try {
                LocalDate data = LocalDate.parse(dataOpcional);
                LocalDateTime inicioDia = data.atStartOfDay();
                LocalDateTime fimDia = data.atTime(LocalTime.MAX);

                log.info("6. Buscando intervalo: {} até {}", inicioDia, fimDia);

                slotsEncontrados = slotRepository.findByMedico_IdAndDataHoraInicioBetweenOrderByDataHoraInicioAsc(
                    medicoIdPK, 
                    inicioDia, 
                    fimDia
                );
            } catch (DateTimeParseException e) {
                log.error("Data inválida recebida: {}", dataOpcional);
                throw new BusinessRuleException("Data inválida. Use o formato AAAA-MM-DD.");
            }
        } else {
            log.info("6. Buscando TODOS os slots (sem filtro de data)");
            slotsEncontrados = slotRepository.findAllByMedico_IdOrderByDataHoraInicioAsc(medicoIdPK);
        }

        log.info("7. Query finalizada. Total de registros encontrados: {}", slotsEncontrados.size());
        
        if (slotsEncontrados.isEmpty()) {
            log.warn("ALERTA: O médico existe, mas a query retornou 0 slots. Verifique se as datas no banco batem com o filtro.");
        }

        // 4. SALVA NO CACHE (TTL de 10 minutos, por exemplo)
        if (!slotsEncontrados.isEmpty()) {
            cacheService.saveWithTtl(cacheKey, slotsEncontrados, 10, TimeUnit.MINUTES);
            log.info("8. Resultado salvo no Cache Redis.");
        }

        return slotsEncontrados;
    }

    private HorarioSlot buscarSlotPorId(Long id) {
        return slotRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Slot de horário não encontrado."));
    }
    
    // Método auxiliar para invalidar cache quando a agenda muda
    private void limparCacheDoMedico(String medicoPublicId) {
        // Apaga tudo que começa com "agenda:slots:uuid-do-medico"
        String pattern = CACHE_PREFIX + medicoPublicId + "*";
        cacheService.deletePattern(pattern);
        log.info("Cache invalidado para padrão: {}", pattern);
    }
}