package com.citywatch.repository;

import com.citywatch.entity.Area;
import com.citywatch.entity.Complaint;
import com.citywatch.entity.User;
import com.citywatch.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {

    List<Complaint> findByAreaOrderByCreatedAtDesc(Area area);

    List<Complaint> findByCitizenOrderByCreatedAtDesc(User citizen);

    List<Complaint> findByAssignedCoordinatorOrderByCreatedAtDesc(User coordinator);

    List<Complaint> findByAreaAndStatusOrderByCreatedAtDesc(Area area, ComplaintStatus status);

    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    // For SLA scheduler — finds all non-closed complaints past deadline
    @Query("SELECT c FROM Complaint c WHERE c.slaDeadline IS NOT NULL AND c.slaDeadline < :now AND c.status NOT IN ('CLOSED', 'REJECTED', 'DELAYED')")
    List<Complaint> findOverduComplaints(@Param("now") LocalDateTime now);

    // Nearby duplicate detection (~500m radius, delta=0.005 degrees)
    @Query("SELECT c FROM Complaint c WHERE ABS(c.latitude - :lat) < :delta AND ABS(c.longitude - :lng) < :delta AND c.status NOT IN ('REJECTED', 'CLOSED')")
    List<Complaint> findNearby(@Param("lat") Double lat, @Param("lng") Double lng, @Param("delta") Double delta);

    // Rate limit check — count submissions by citizen in last 24h
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.citizen = :citizen AND c.createdAt > :since")
    long countByCitizenSince(@Param("citizen") User citizen, @Param("since") LocalDateTime since);

    // Paginated Methods
    org.springframework.data.domain.Page<Complaint> findAllByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Complaint> findByAreaOrderByCreatedAtDesc(Area area, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE c.latitude >= :minLat AND c.latitude <= :maxLat AND c.longitude >= :minLng AND c.longitude <= :maxLng AND c.status NOT IN ('REJECTED', 'CLOSED') ORDER BY c.createdAt DESC")
    List<Complaint> findInBoundingBox(@Param("minLat") Double minLat, @Param("maxLat") Double maxLat, @Param("minLng") Double minLng, @Param("maxLng") Double maxLng);
}
