package br.edu.fatecpg.usafa.features.Admin.services.Appointment;



import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.document.RequestAppointment;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.UpdateAppointmentDTO;
import br.edu.fatecpg.usafa.features.Admin.interfaces.Appointment.IAppointmentConsumerService;
import br.edu.fatecpg.usafa.features.Admin.utils.appointment.AppointmentConsumerHelper;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaDocumentRepository;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentConsumerServiceImpl implements IAppointmentConsumerService {

    private static final String CACHE_KEY_REQUESTS = "appointment:requests:all";

    // Repositórios
    private final IConsultaDocumentRepository mongoRepository;

    private final ICacheService cacheService; // Injeção do seu serviço de Cache

    //Helper
    private final AppointmentConsumerHelper helper;

    @Override
    public List<RequestAppointment> getAllConsultaRequests() {
        // 1. Tenta buscar do Cache primeiro (Performance)
        @SuppressWarnings("unchecked")
        List<RequestAppointment> cachedList = cacheService.get(CACHE_KEY_REQUESTS, List.class);
        
        if (cachedList != null) {
            log.info("Admin: Retornando solicitações do Cache Redis.");
            return cachedList;
        }

        // 2. Se não tiver no cache, busca no Mongo
        log.info("Admin: Buscando solicitações no MongoDB (Cache Miss).");
        List<RequestAppointment> requests = mongoRepository.findAll(Sort.by(Sort.Direction.DESC, "dia", "horario"));

        // 3. Salva no Cache (Ex: 10 minutos de TTL para não ficar obsoleto muito tempo)
        if (!requests.isEmpty()) {
            cacheService.saveWithTtl(CACHE_KEY_REQUESTS, requests, 10, TimeUnit.MINUTES);
        }

        return requests;
    }

    @Override
    @Transactional // Cuidado: Transactional geralmente só faz rollback do SQL, não do Mongo (a menos que configurado ChainedTransactionManager)
    public RequestAppointment updateConsultaStatus(String consultaId, UpdateAppointmentDTO dto) {
        log.info("Processando atualização para solicitação ID: {}", consultaId);

        // 1. Busca Fail-Fast
        RequestAppointment doc = mongoRepository.findById(consultaId)
                .orElseThrow(() -> new BusinessRuleException("Solicitação não encontrada: " + consultaId));

        LocalDate dtoDia = LocalDate.parse(dto.dia());
        LocalTime dtoHorario = LocalTime.parse(dto.horario());
        String dtoStatus = dto.status().toUpperCase();

        // 2. Verifica se houve mudança real (Idempotência)
        if (helper.isSameStatusAndDate(doc, dtoStatus, dtoDia, dtoHorario)) {
            log.info("Nenhuma mudança detectada para ID: {}. Retornando.", consultaId);
            return doc;
        }

        RequestAppointment resultDoc;

        // 3. Processamento
        if ("ACEITA".equals(dtoStatus)) {
            resultDoc = helper.processarAceite(doc, dtoDia, dtoHorario);
        } else {
            resultDoc = helper.processarAtualizacaoMongo(doc, dtoDia, dtoHorario, dtoStatus);
        }

        // 4. Limpeza de Cache (Padrão Write-Through/Invalidation)
        // Como mudamos o estado dos dados, o cache da lista antiga é inválido.
        cacheService.delete(CACHE_KEY_REQUESTS); 

        return resultDoc;
    }

    @Override
    public void deleteConsultaRequest(String consultaId) {
        if (!mongoRepository.existsById(consultaId)) {
            throw new BusinessRuleException("Solicitação não encontrada para exclusão: " + consultaId);
        }
        
        mongoRepository.deleteById(consultaId);
        
        // Invalida o cache para a lista refletir a exclusão
        cacheService.delete(CACHE_KEY_REQUESTS);
        
        log.info("Solicitação ID: {} deletada e cache invalidado.", consultaId);
    }

}