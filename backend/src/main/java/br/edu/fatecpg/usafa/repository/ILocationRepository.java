package br.edu.fatecpg.usafa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.Usafa;

import java.util.List;
import java.util.Optional;

@Repository
public interface ILocationRepository extends JpaRepository<Usafa, Long> {

    /**
     * Encontra uma localidade pelo nome.
     * (Corrigido de 'findByStreetName' para 'findByNome' para bater com o Model)
     */
    Optional<Usafa> findByNome(String nome);

    /**
     * Encontra uma Usafa pelo ID público do usuário associado.
     * (Este é o método crucial que o Service precisa)
     */
    Optional<Usafa> findByUser_PublicId(String publicId);

    /**
     * Encontra localidades pelo CEP.
     * (Corrigido de 'findByPostalCode' para 'findByCep' para bater com o Model)
     */
    List<Usafa> findByCep(String cep);
}