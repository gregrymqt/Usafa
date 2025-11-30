package br.edu.fatecpg.usafa.features.picture.services;

import br.edu.fatecpg.usafa.features.picture.dtos.PictureDto; // Ajuste no import
import br.edu.fatecpg.usafa.features.picture.repository.IPictureRepository;
import br.edu.fatecpg.usafa.features.picture.utils.PictureHelper;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import br.edu.fatecpg.usafa.models.Picture;
import br.edu.fatecpg.usafa.shared.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PictureService {

    private final IPictureRepository pictureRepository;
    private final PictureHelper pictureHelper;

    @Transactional
    public PictureDto create(PictureDto pictureDto) {
        try {
            // Lógica para criar os diretórios
            if (pictureDto.getGroup() != null && !pictureDto.getGroup().isBlank()) {
                pictureHelper.createGroupDirectory(pictureDto.getGroup());
            }

            Picture picture = Picture.builder()
                    .title(pictureDto.getTitle())
                    .url(pictureDto.getUrl())
                    .group(pictureDto.getGroup()) // CORREÇÃO: Usando o campo 'group' do DTO
                    .build();

            Picture savedPicture = pictureRepository.save(picture);
            return pictureHelper.toDto(savedPicture);
        } catch (IOException e) {
            throw new DatabaseOperationException("Failed to create directories for picture group", e);
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Failed to create picture", e);
        }
    }

    @Transactional(readOnly = true)
    public PictureDto findById(Long id) {
        try {
            return pictureRepository.findById(id)
                    .map(pictureHelper::toDto)
                    .orElseThrow(() -> new NotFoundException("Picture not found with id: " + id));
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Failed to find picture by id: " + id, e);
        }
    }

    @Transactional(readOnly = true)
    public List<PictureDto> findByGroup(String group) {
        try {
            return pictureRepository.findByGroup(group).stream()
                    .map(pictureHelper::toDto)
                    .collect(Collectors.toList());
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Failed to find pictures by group: " + group, e);
        }
    }

    @Transactional(readOnly = true)
    public List<PictureDto> findByTitle(String title) {
        try {
            return pictureRepository.findByTitleContainingIgnoreCase(title).stream()
                    .map(pictureHelper::toDto)
                    .collect(Collectors.toList());
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Failed to find pictures by title: " + title, e);
        }
    }

    @Transactional(readOnly = true)
    public List<PictureDto> findAll() {
        try {
            return pictureRepository.findAll().stream()
                    .map(pictureHelper::toDto)
                    .collect(Collectors.toList());
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Failed to retrieve all pictures", e);
        }
    }

    @Transactional
    public PictureDto update(Long id, PictureDto pictureDto) {
        try {
            Picture existingPicture = pictureRepository.findById(id)
                    .orElseThrow(() -> new NotFoundException("Picture not found with id: " + id));

            existingPicture.setTitle(pictureDto.getTitle());
            existingPicture.setUrl(pictureDto.getUrl());
            existingPicture.setGroup(pictureDto.getGroup()); // CORREÇÃO

            Picture updatedPicture = pictureRepository.save(existingPicture);
            return pictureHelper.toDto(updatedPicture);
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Failed to update picture with id: " + id, e);
        }
    }

    @Transactional
    public void delete(Long id) {
        try {
            if (!pictureRepository.existsById(id)) {
                throw new NotFoundException("Picture not found with id: " + id);
            }
            pictureRepository.deleteById(id);
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Failed to delete picture with id: " + id, e);
        }
    }
}
