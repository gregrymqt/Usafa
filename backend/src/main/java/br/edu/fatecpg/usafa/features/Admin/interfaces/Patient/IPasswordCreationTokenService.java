package br.edu.fatecpg.usafa.features.Admin.interfaces.Patient;

import java.util.Optional;

import br.edu.fatecpg.usafa.document.PasswordCreationToken;
import br.edu.fatecpg.usafa.models.User;

public interface IPasswordCreationTokenService {

    String createAndSaveToken(User user);

    Optional<PasswordCreationToken> findTokenByUserPublicId(String userPublicId);

    void deleteToken(String userPublicId);

}
