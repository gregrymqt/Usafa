package br.edu.fatecpg.usafa.features.picture.services;

import br.edu.fatecpg.usafa.features.picture.dtos.PictureDto; // Ajuste no import
import br.edu.fatecpg.usafa.features.picture.interfaces.IPictureService;
import br.edu.fatecpg.usafa.features.picture.repository.IPictureRepository;
import br.edu.fatecpg.usafa.features.picture.utils.PictureHelper;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import br.edu.fatecpg.usafa.models.Picture;
import br.edu.fatecpg.usafa.shared.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.dao.DataAccessException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PictureService implements IPictureService {

    private final IPictureRepository pictureRepository;
    private final PictureHelper pictureHelper;

    @Transactional
    public PictureDto create(PictureDto pictureDto) {
        try {
            if (pictureDto.getGroup() != null && !pictureDto.getGroup().isBlank()) {
                pictureHelper.createGroupDirectory(pictureDto.getGroup());
            }

            Picture picture = Picture.builder()
                    .title(pictureDto.getTitle())
                    .url(pictureDto.getUrl())
                    .group(pictureDto.getGroup())
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
            existingPicture.setGroup(pictureDto.getGroup());

            Picture updatedPicture = pictureRepository.save(existingPicture);
            return pictureHelper.toDto(updatedPicture);
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Failed to update picture with id: " + id, e);
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        try {
            Picture picture = pictureRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Picture not found with id: " + id));

            // [CORREÇÃO] 1. Apaga o arquivo físico do disco antes de deletar do banco
            if (picture != null && picture.getUrl() != null) {
            // Agora chama o método que implementamos no Helper
            pictureHelper.deleteFile(picture.getUrl());
            log.info("Arquivo físico deletado (se existia): {}", picture.getUrl());
        }

            // 2. Apaga o registro do banco
            pictureRepository.deleteById(id);
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Failed to delete picture with id: " + id, e);
        }
    }

    @Override
    @Transactional
    public Picture uploadAndGetPicture(MultipartFile file, String group) {
        try {
            String fileUrl = pictureHelper.saveFile(file, group);
            Picture picture = Picture.builder()
                .title(file.getOriginalFilename())
                .url(fileUrl)
                .group(group)
                .build();
            return pictureRepository.save(picture);
        } catch (IOException | DataAccessException e) {
            throw new DatabaseOperationException("Failed to upload file and create picture record for group: " + group, e);
        }
    }
}