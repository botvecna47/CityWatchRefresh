package com.citywatch.repository;

import com.citywatch.entity.SpamReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpamReportRepository extends JpaRepository<SpamReport, String> {
    List<SpamReport> findByStatus(String status);
}
