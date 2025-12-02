package br.edu.fatecpg.usafa.features.auth.services;

import br.edu.fatecpg.usafa.features.auth.dtos.*;
import br.edu.fatecpg.usafa.features.auth.interfaces.IUserAppService;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.auth.utilis.UserUtils;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.models.Picture;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.tokens.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j // 1. Habilita o logger
public class UserAppService implements IUserAppService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserUtils userUtils;

    // --- LOGIN MANUAL ---
    @Override
    public UserResponseDTO processManualLogin(LoginRequestDTO data) {
        log.info("Tentativa de login manual para o email: {}", data.email());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(data.email(), data.password()));

            User userDetails = (User) authentication.getPrincipal();
            log.info("Usuário autenticado com sucesso: {}", userDetails.getId());

            String token = jwtUtils.generateToken(userDetails);
            log.debug("Token gerado para login manual.");

            return userUtils.buildResponseDTO(userDetails, token);

        } catch (BadCredentialsException e) {
            log.warn("Falha no login manual: Credenciais inválidas para {}", data.email());
            throw new BusinessRuleException("E-mail ou senha inválidos.");
        } catch (Exception e) {
            log.error("Erro inesperado no login manual", e);
            throw e;
        }
    }

    // --- REGISTRO MANUAL ---
    @Override
    @Transactional
    public UserResponseDTO processManualRegistration(RegisterRequestDTO data) {
        log.info("Iniciando registro manual para: {}", data.email());

        if (userRepository.findUserByEmail(data.email()).isPresent()) {
            log.warn("Tentativa de registro duplicado para email: {}", data.email());
            throw new BusinessRuleException("Este e-mail já está em uso.");
        }

        User newUser = new User();
        newUser.setName(data.name());
        newUser.setEmail(data.email());
        newUser.setPassword(passwordEncoder.encode(data.password()));
        newUser.setCpf(data.cpf());
        newUser.setCep(data.cep());
        newUser.setPhone(data.phone());
        newUser.setCreatedByAdmin(false);

        try {
            String dateStr = data.birthDate().length() >= 10 ? data.birthDate().substring(0, 10) : data.birthDate();
            newUser.setBirthDate(LocalDate.parse(dateStr));
        } catch (Exception e) {
            log.error("Erro ao fazer parse da data: {}", data.birthDate(), e);
            throw new BusinessRuleException("Formato de data de nascimento inválido.");
        }

        userUtils.assignDefaultRole(newUser);
        User savedUser = userRepository.save(newUser);
        log.info("Novo usuário salvo com ID: {}", savedUser.getId());

        String token = jwtUtils.generateToken(savedUser);
        return userUtils.buildResponseDTO(savedUser, token);
    }

    // --- LOGIN / REGISTRO VIA GOOGLE ---
    @Override
    @Transactional
    public ResponseGoogleDTO processGoogleLogin(LoginGoogleRequestDTO googleUser) {
        log.info("Processando Login Google para email: {}", googleUser.email());

        Optional<User> existingUserOpt = userRepository.findUserByEmail(googleUser.email());
        User userToSave;
        boolean isNewUser = false;
        boolean needsCompletion = false;

        if (existingUserOpt.isPresent()) {
            log.info("Usuário Google já existe no banco via email.");
            userToSave = existingUserOpt.get();
            userToSave.setName(googleUser.name());

            // Lógica de atualização da Picture
            String newPictureUrl = googleUser.picture();
            if (newPictureUrl != null && !newPictureUrl.isBlank()) {
                Picture currentPicture = userToSave.getPicture();
                if (currentPicture != null) {
                    log.info("Atualizando URL da foto de perfil existente para o usuário: {}", googleUser.email());
                    currentPicture.setUrl(newPictureUrl);
                } else {
                    log.info("Criando nova entidade Picture para usuário existente: {}", googleUser.email());
                    Picture newPicture = Picture.builder()
                            .url(newPictureUrl)
                            .group("perfil")
                            .title("Foto de Perfil de " + googleUser.name())
                            .build();
                    userToSave.setPicture(newPicture);
                }
            }

            if (userToSave.getGoogleId() == null) {
                log.info("Vinculando Google ID ao usuário existente.");
                userToSave.setGoogleId(googleUser.googleId());
            }

            if (userUtils.isProfileIncomplete(userToSave)) {
                log.info("Usuário existente precisa completar cadastro.");
                needsCompletion = true;
            }

        } else {
            log.info("Novo usuário identificado via Google. Criando registro...");
            isNewUser = true;
            needsCompletion = true;

            userToSave = new User();
            userToSave.setName(googleUser.name());
            userToSave.setEmail(googleUser.email());
            userToSave.setGoogleId(googleUser.googleId());
            userToSave.setCreatedByAdmin(false);

            // Lógica de criação da Picture
            String pictureUrl = googleUser.picture();
            if (pictureUrl != null && !pictureUrl.isBlank()) {
                Picture newPicture = Picture.builder().url(pictureUrl).group("perfil")
                        .title("Foto de Perfil de " + googleUser.name()).build();
                userToSave.setPicture(newPicture);
            }

            userUtils.assignDefaultRole(userToSave);
        }

        log.debug("Salvando usuário no banco...");
        User savedUser = userRepository.save(userToSave);
        log.info("Usuário Google salvo/atualizado com sucesso. ID: {}", savedUser.getId());

        // --- PONTO CRÍTICO DO SEU ERRO ---
        log.debug("Chamando jwtUtils.generateToken...");
        String token = jwtUtils.generateToken(savedUser);
        // Se a linha acima for Async e retornar String, o Java lança a exceção aqui.
        log.debug("Token JWT gerado com sucesso.");

        List<String> roles = savedUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        // Atualize o return para incluir os dados do savedUser
        return new ResponseGoogleDTO(
                token,
                savedUser.getPublicId().toString(),
                roles,
                isNewUser,
                needsCompletion,
                savedUser.getName(), // Novo
                savedUser.getEmail(), // Novo
                // CORREÇÃO: Extrai a URL da entidade Picture, se ela existir.
                savedUser.getPicture() != null ? savedUser.getPicture().getUrl() : null);
    }

    // --- ATUALIZAÇÃO ---
    @Override
    @Transactional
    public Optional<UserResponseDTO> updateUserByPublicId(String publicId, UpdateUserByPublicIdDTO data) {
        log.info("Atualizando dados do usuário PublicID: {}", publicId);
        UUID uuid;
        try {
            uuid = UUID.fromString(publicId);
        } catch (IllegalArgumentException e) {
            log.warn("PublicID inválido recebido: {}", publicId);
            throw new BusinessRuleException("ID do usuário inválido.");
        }

        return userRepository.findByPublicId(uuid)
                .map(user -> {
                    user.setCep(data.cep());
                    user.setCpf(data.cpf());
                    user.setPhone(data.phone());
                    user.setBirthDate(LocalDate.parse(data.birthDate()));
                    user.setPassword(passwordEncoder.encode(data.password()));

                    User savedUser = userRepository.save(user);
                    log.info("Usuário atualizado com sucesso.");

                    String token = jwtUtils.generateToken(savedUser);
                    return userUtils.buildResponseDTO(savedUser, token);
                });
    }
}