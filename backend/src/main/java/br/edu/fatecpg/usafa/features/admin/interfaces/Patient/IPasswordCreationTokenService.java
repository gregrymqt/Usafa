package br.edu.fatecpg.usafa.features.admin.interfaces.Patient;

import java.util.Optional;

import br.edu.fatecpg.usafa.features.admin.dtos.patient.CreatePasswordDTO;
import br.edu.fatecpg.usafa.features.auth.dtos.UserResponseDTO;
import br.edu.fatecpg.usafa.models.PasswordCreationToken;
import br.edu.fatecpg.usafa.models.User;

public interface IPasswordCreationTokenService {

    Optional<PasswordCreationToken> createAndSaveToken(User user);

    Optional<PasswordCreationToken> findTokenByUserPublicId(String userPublicId);

    void deleteToken(String userPublicId);

    UserResponseDTO validateTokenAndGetUser(String tokenId);

    void createPassword(CreatePasswordDTO createPasswordDto);

}
