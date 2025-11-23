// br/edu/fatecpg/usafa/features/auth/UserAppService.java

package br.edu.fatecpg.usafa.features.auth.services; // (Ajuste o package se necessário)

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority; // 2. Importar
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.auth.dtos.LoginGoogleRequestDTO;
import br.edu.fatecpg.usafa.features.auth.dtos.LoginRequestDTO;
import br.edu.fatecpg.usafa.features.auth.dtos.RegisterRequestDTO;
import br.edu.fatecpg.usafa.features.auth.dtos.ResponseDTO;
import br.edu.fatecpg.usafa.features.auth.dtos.ResponseGoogleDTO;
import br.edu.fatecpg.usafa.features.auth.dtos.UpdateUserByPublicIdDTO;
import br.edu.fatecpg.usafa.features.auth.interfaces.IUserAppService;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.auth.utilis.UserUtils;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.tokens.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserAppService implements IUserAppService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserUtils userUtils;


    // --- LOGIN MANUAL ---
    @Override
    public ResponseDTO processManualLogin(LoginRequestDTO data) {
        try {
            // 1. Autentica via Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(data.email(), data.password()));

            // 2. Recupera o UserDetails (User)
            User userDetails = (User) authentication.getPrincipal();

            // 3. Gera o token
            String token = jwtUtils.generateToken(userDetails);

            // 4. Retorna DTO padronizado
            return userUtils.buildResponseDTO(userDetails, token);

        } catch (BadCredentialsException e) {
            // Encapsula erro de segurança em erro de negócio para não vazar detalhes
            throw new BusinessRuleException("E-mail ou senha inválidos.");
        }
    }

    // --- REGISTRO MANUAL ---
    @Override
    @Transactional // Garante que o usuário e a role sejam salvos juntos ou nada feito
    public ResponseDTO processManualRegistration(RegisterRequestDTO data) {
        // 1. Fail-fast: Valida duplicidade
        if (userRepository.findByEmail(data.email()).isPresent()) {
            throw new BusinessRuleException("Este e-mail já está em uso.");
        }

        // 2. Prepara o usuário
        User newUser = new User();
        newUser.setName(data.name());
        newUser.setEmail(data.email());
        newUser.setPassword(passwordEncoder.encode(data.password()));
        newUser.setCpf(data.cpf());
        newUser.setCep(data.cep());
        newUser.setPhone(data.phone());
        newUser.setCreatedByAdmin(false);

        // Tratamento seguro de data
        try {
            // Assume formato ISO (YYYY-MM-DD) ou similar vindo do front
            // Se vier com hora (ex: 2000-01-01T00:00:00), usamos substring ou parse seguro
            String dateStr = data.birthDate().length() >= 10 ? data.birthDate().substring(0, 10) : data.birthDate();
            newUser.setBirthDate(LocalDate.parse(dateStr));
        } catch (Exception e) {
            throw new BusinessRuleException("Formato de data de nascimento inválido.");
        }

        // 3. Atribui Role e Salva
        userUtils.assignDefaultRole(newUser);
        User savedUser = userRepository.save(newUser);

        // 4. Gera token e retorna
        String token = jwtUtils.generateToken(savedUser);
        return userUtils.buildResponseDTO(savedUser, token);
    }

    // --- LOGIN / REGISTRO VIA GOOGLE ---
    @Override
    @Transactional
    public ResponseGoogleDTO processGoogleLogin(LoginGoogleRequestDTO googleUser) {
        Optional<User> existingUserOpt = userRepository.findByEmail(googleUser.email());
        User userToSave;
        boolean isNewUser = false;
        boolean needsCompletion = false;

        if (existingUserOpt.isPresent()) {
            // --- USUÁRIO EXISTENTE ---
            userToSave = existingUserOpt.get();
            userToSave.setName(googleUser.name()); // Atualiza nome se mudou no Google
            userToSave.setPicture(googleUser.picture());
            
            if (userToSave.getGoogleId() == null) {
                userToSave.setGoogleId(googleUser.googleId()); // Vincula conta existente ao Google
            }

            // Verifica se falta preencher dados obrigatórios do sistema
            if (userUtils.isProfileIncomplete(userToSave)) {
                needsCompletion = true;
            }

        } else {
            // --- NOVO USUÁRIO ---
            isNewUser = true;
            needsCompletion = true; // Novo usuário Google SEMPRE precisa completar CPF/CEP etc.

            userToSave = new User();
            userToSave.setName(googleUser.name());
            userToSave.setEmail(googleUser.email());
            userToSave.setPicture(googleUser.picture());
            userToSave.setGoogleId(googleUser.googleId());
            userToSave.setCreatedByAdmin(false);
            
            userUtils.assignDefaultRole(userToSave);
        }

        User savedUser = userRepository.save(userToSave);
        String token = jwtUtils.generateToken(savedUser);
        
        // Obtém roles para retorno
        List<String> roles = savedUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList(); // Java 16+ (ou .collect(Collectors.toList()))

        return new ResponseGoogleDTO(
                token,
                savedUser.getPublicId().toString(),
                roles,
                isNewUser,
                needsCompletion
        );
    }

    // --- ATUALIZAÇÃO DE CADASTRO (COMPLETAR DADOS) ---
    @Override
    @Transactional
    public Optional<ResponseDTO> updateUserByPublicId(String publicId, UpdateUserByPublicIdDTO data) {
        UUID uuid;
        try {
            uuid = UUID.fromString(publicId);
        } catch (IllegalArgumentException e) {
             throw new BusinessRuleException("ID do usuário inválido.");
        }

        return userRepository.findByPublicId(uuid)
                .map(user -> {
                    user.setCep(data.cep());
                    user.setCpf(data.cpf());
                    // Se houver outros campos para completar, adicione aqui
                    
                    User savedUser = userRepository.save(user);
                    
                    // Gera novo token com as claims atualizadas (se o token carregar dados do user)
                    String token = jwtUtils.generateToken(savedUser);
                    
                    return userUtils.buildResponseDTO(savedUser, token);
                });
    }
}