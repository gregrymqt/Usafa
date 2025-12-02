package br.edu.fatecpg.usafa.features.auth.interfaces;

import java.util.Optional;

import br.edu.fatecpg.usafa.features.auth.dtos.*;


public interface IUserAppService {
    UserResponseDTO processManualLogin(LoginRequestDTO data);
    UserResponseDTO processManualRegistration(RegisterRequestDTO data);
    ResponseGoogleDTO processGoogleLogin(LoginGoogleRequestDTO googleUser);
    Optional<UserResponseDTO> updateUserByPublicId(String publicId, UpdateUserByPublicIdDTO data);
}
