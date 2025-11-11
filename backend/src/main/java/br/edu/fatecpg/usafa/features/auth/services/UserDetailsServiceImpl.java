package br.edu.fatecpg.usafa.features.auth.services;

import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.repository.IUserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    // A ÚNICA dependência que esta classe precisa é o repositório.
    private final IUserRepository userRepository;

    
    // O construtor só recebe o repositório.
    public UserDetailsServiceImpl(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Este é o ÚNICO método da interface.
     * O Spring Security chama ele quando precisa autenticar alguém.
     *
     * @param username (No nosso caso, será o email)
     * @return um objeto UserDetails (que a sua entidade 'User' vai implementar)
     * @throws UsernameNotFoundException se o usuário não for achado
     */
    @Async
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Log para debug
        System.out.println("Tentando carregar usuário: " + username);
        

        User user = userRepository.findByEmail(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Usuário não encontrado com o email: " + username));
        return user;
    }
}
