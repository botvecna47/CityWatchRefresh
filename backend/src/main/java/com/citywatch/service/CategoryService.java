package com.citywatch.service;

import com.citywatch.entity.Category;
import com.citywatch.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    @Transactional
    public Category create(Category category) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category with this name already exists");
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public Category update(Long id, Category details) {
        Category category = getById(id);
        category.setName(details.getName());
        category.setDescription(details.getDescription());
        category.setDefaultSlaHours(details.getDefaultSlaHours());
        return categoryRepository.save(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = getById(id);
        category.setDeleted(true);
        categoryRepository.save(category);
    }
}
