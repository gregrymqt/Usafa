package br.edu.fatecpg.usafa.features.profile.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserProfileUpdateDTO(
    
    @NotBlank(message = "O nome não pode estar em branco")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres")
    String name,
    
    @NotBlank(message = "O CEP não pode estar em branco")
    @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "Formato de CEP inválido. Use XXXXX-XXX ou XXXXXXXX")
    String cep
    ) {}