package br.edu.fatecpg.usafa.features.profile.interfaces;

import br.edu.fatecpg.usafa.features.profile.dtos.UserProfileResponseDTO;
import br.edu.fatecpg.usafa.features.profile.dtos.UserProfileUpdateDTO;

public interface IUserProfileService {
     UserProfileResponseDTO getUserProfile(String email);
     UserProfileResponseDTO updateUserProfile(String email, UserProfileUpdateDTO updateDTO);    
}
