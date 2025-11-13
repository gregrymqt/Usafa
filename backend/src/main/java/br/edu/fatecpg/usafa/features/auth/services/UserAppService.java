// br/edu/fatecpg/usafa/features/auth/UserAppService.java

package br.edu.fatecpg.usafa.features.auth.services; // (Ajuste o package se necessário)

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority; // 2. Importar
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.edu.fatecpg.usafa.features.auth.dtos.LoginGoogleRequestDTO;
import br.edu.fatecpg.usafa.features.auth.dtos.LoginRequestDTO;
import br.edu.fatecpg.usafa.features.auth.dtos.RegisterRequestDTO;
import br.edu.fatecpg.usafa.features.auth.dtos.ResponseDTO;
import br.edu.fatecpg.usafa.features.auth.dtos.ResponseGoogleDTO;
import br.edu.fatecpg.usafa.features.auth.dtos.UpdateUserByPublicIdDTO;
import br.edu.fatecpg.usafa.features.auth.interfaces.IUserAppService;
import br.edu.fatecpg.usafa.models.Role;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.repository.IRolesRepository;
import br.edu.fatecpg.usafa.repository.IUserRepository;
import br.edu.fatecpg.usafa.shared.tokens.JwtUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections; // 3. Importar
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors; // 4. Importar

@Service
public class UserAppService implements IUserAppService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IRolesRepository roleRepository; // (Mantive seu nome)
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Autowired
    public UserAppService(IUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            IRolesRepository roleRepository,
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Async
    @Override
    public ResponseDTO processManualLogin(LoginRequestDTO data) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(data.email(), data.password()));

        // 1. O 'principal' AGORA é o nosso UserDetails (que é o User)
        User userDetails = (User) authentication.getPrincipal();

        // 2. MUDANÇA CRÍTICA: Geramos o token a partir do UserDetails
        //    Isso permite que o JwtUtils coloque as roles DENTRO do token.
        //    (Estou assumindo que você ajustou o JwtUtils.generateToken conforme nossa conversa)
        String token = jwtUtils.generateToken(userDetails); 

        // 3. Pega a lista de roles (como strings) a partir das 'authorities'
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // 4. Retorna o DTO completo, incluindo as roles
        return new ResponseDTO(
                token,
                userDetails.getPublicId().toString(),
                userDetails.getName(),
                userDetails.getEmail(),
                userDetails.getCep(),
                userDetails.getPhone(),
                (userDetails.getBirthDate() != null)
                                    ? userDetails.getBirthDate().atStartOfDay().format(DateTimeFormatter.ISO_DATE_TIME) + "Z"
                                    : null,
                roles // <-- PREENCHIDO
        );
    }

    @Async
    @Override
    public ResponseDTO processManualRegistration(RegisterRequestDTO data) {
        if (userRepository.findByEmail(data.email()).isPresent()) {
            throw new IllegalStateException("Este e-mail já está cadastrado.");
        }

        String encryptedPassword = passwordEncoder.encode(data.password());

        User newUser = new User(data.name(),
                data.email(),
                encryptedPassword,
                null,
                null,
                data.cpf(),
                data.cep(),
                data.phone(),
                LocalDate.parse(data.birthDate().substring(0, 10))); // Extrai "YYYY-MM-DD" e converte

        // 5. Atribui a role padrão (agora implementado)
        assignDefaultRole(newUser);

        User savedUser = userRepository.save(newUser);

        // 6. Gera o token (também a partir do UserDetails)
        String token = jwtUtils.generateToken(savedUser);

        // 7. Pega as roles
        List<String> roles = savedUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // 8. Retorna o DTO completo
        return new ResponseDTO(
                token,
                savedUser.getPublicId().toString(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getCep(),
                savedUser.getPhone(),
               (savedUser.getBirthDate() != null)
                                    ? savedUser.getBirthDate().atStartOfDay().format(DateTimeFormatter.ISO_DATE_TIME) + "Z"
                                    : null,
                roles // <-- PREENCHIDO
        );
    }

    @Async
    @Override
    public ResponseGoogleDTO processGoogleLogin(LoginGoogleRequestDTO googleUser) {
        Optional<User> existingUserOpt = userRepository.findByEmail(googleUser.email());
        User userToSave;
        boolean isNewUser = false;
        boolean needsCompletion = false; // <-- NOSSO NOVO FLAG

        if (existingUserOpt.isPresent()) {
            // --- USUÁRIO EXISTENTE ---
            userToSave = existingUserOpt.get();
            userToSave.setName(googleUser.name());
            userToSave.setPicture(googleUser.picture());
            if (userToSave.getGoogleId() == null) {
                userToSave.setGoogleId(googleUser.googleId());
                }

            // --- LÓGICA DE VALIDAÇÃO (NOVA) ---
            // Verifica se o usuário EXISTENTE não preencheu os dados
            if (userToSave.getCpf() == null || userToSave.getCpf().isBlank() ||
                userToSave.getCep() == null || userToSave.getCep().isBlank() ||
                userToSave.getPhone() == null || userToSave.getPhone().isBlank() ||
                userToSave.getBirthDate() == null) {
                
                needsCompletion = true; // <-- AVISA O FRONT-END
            }

        } else {
            // --- USUÁRIO NOVO ---
            isNewUser = true;
            needsCompletion = true; // <-- Um usuário novo SEMPRE precisa completar
            
            userToSave = new User();
            userToSave.setName(googleUser.name());
            userToSave.setEmail(googleUser.email());
            userToSave.setPicture(googleUser.picture());
            userToSave.setGoogleId(googleUser.googleId());
            userToSave.setPassword(null); 
            assignDefaultRole(userToSave); // Atribui ROLE_USER
        }

        User savedUser = userRepository.save(userToSave);
         // Gera o token (que agora terá a ROLE_USER)
        String token = jwtUtils.generateToken(savedUser);
        // Pega as roles (para o DTO)
        List<String> roles = savedUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // 9. Retorna o DTO do Google (MODIFICADO)
        return new ResponseGoogleDTO(
                token,
                savedUser.getPublicId().toString(),
                roles,
                isNewUser,
                needsCompletion // <-- RETORNA O NOVO FLAG
        
);
    }

    @Async
    @Override
    public Optional<ResponseDTO> updateUserByPublicId(String publicId, UpdateUserByPublicIdDTO data) {
        return userRepository.findByPublicId(UUID.fromString(publicId))
                .map(user -> {
                    // Atualiza CPF/CEP
                    user.setCep(data.cep());
                    user.setCpf(data.cpf());
                    User savedUser = userRepository.save(user);

                    // Gera um NOVO token (agora com CPF/CEP)
                    String token = jwtUtils.generateToken(savedUser);

                    // Pega as roles
                    List<String> roles = savedUser.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.toList());

                    // Retorna o DTO completo
                    return new ResponseDTO(
                            token,
                            savedUser.getPublicId().toString(),
                            savedUser.getName(),
                            savedUser.getEmail(),
                            savedUser.getCep(),
                            savedUser.getPhone(),
                           (savedUser.getBirthDate() != null)
                                        ? savedUser.getBirthDate().atStartOfDay().format(DateTimeFormatter.ISO_DATE_TIME) + "Z"
                                        : null,
                            roles // <-- PREENCHIDO
                    );
                });
    }

    /**
     * Método privado (helper) para atribuir a role "ROLE_USER"
     * a um novo usuário.
     */
    private void assignDefaultRole(User user) {
        // 1. Busca a role "ROLE_USER" no banco
        Role defaultRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Erro: A role 'ROLE_USER' padrão não foi encontrada no banco."));

        // 2. Adiciona ao Set<Role> do usuário
        user.setRoles(Collections.singleton(defaultRole));
    }
}