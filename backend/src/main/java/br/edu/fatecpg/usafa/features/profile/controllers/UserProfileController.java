package br.edu.fatecpg.usafa.features.profile.controllers;

import br.edu.fatecpg.usafa.features.profile.dtos.*;
import br.edu.fatecpg.usafa.features.profile.services.UserProfileService;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/profile") // Endpoint base para o perfil
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    /**
     * Endpoint para buscar os dados do perfil do *usuário logado*.
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getMyProfile(Authentication authentication) {
        // O 'authentication.getName()' geralmente retorna o e-mail (username)
        // do usuário logado, vindo do token JWT.
        String userEmail = authentication.getName();
        
        UserProfileResponseDTO profile = userProfileService.getUserProfile(userEmail);
        return ResponseEntity.ok(profile);
    }

    /**
     * Endpoint para atualizar os dados do perfil do *usuário logado*.
     */
    @PutMapping(value = "/me", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<UserProfileResponseDTO> updateMyProfile(
            Authentication authentication,
            @Valid @RequestPart("profile") UserProfileUpdateDTO updateDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        String userEmail = authentication.getName();
        
        UserProfileResponseDTO updatedProfile = userProfileService.updateUserProfile(userEmail, updateDTO, file);
        return ResponseEntity.ok(updatedProfile);
    }
}
