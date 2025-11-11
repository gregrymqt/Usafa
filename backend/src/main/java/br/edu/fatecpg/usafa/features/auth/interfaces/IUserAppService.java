package br.edu.fatecpg.usafa.features.auth.interfaces;

import java.util.Optional;

import br.edu.fatecpg.usafa.features.auth.dtos.*;


public interface IUserAppService {
    ResponseDTO processManualLogin(LoginRequestDTO data);
    ResponseDTO processManualRegistration(RegisterRequestDTO data);
    ResponseGoogleDTO processGoogleLogin(LoginGoogleRequestDTO googleUser);
    Optional<ResponseDTO> updateUserByPublicId(String publicId, UpdateUserByPublicIdDTO data);
}
