package com.citywatch.repository;

import com.citywatch.entity.SlaConfig;
import com.citywatch.enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SlaConfigRepository extends JpaRepository<SlaConfig, Long> {

    Optional<SlaConfig> findByCategory(Category category);
}
