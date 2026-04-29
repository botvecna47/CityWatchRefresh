package com.citywatch.repository;

import com.citywatch.entity.CoordinatorApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoordinatorApplicationRepository extends JpaRepository<CoordinatorApplication, String> {
    List<CoordinatorApplication> findByStatus(String status);
}
