package com.citywatch.config;

import com.citywatch.entity.*;
import com.citywatch.enums.*;
import com.citywatch.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

/**
 * DataSeeder — Idempotent startup seeder for CityWatch Nanded demo data.
 *
 * ► Disabled by default to protect demo and testing data.
 * ► To run, add `app.seed-data=true` in application.properties or run with `-Dapp.seed-data=true`.
 * ► ALWAYS force-resets demo-account passwords so they stay in sync with
 *   whatever BCrypt format the current Spring Security version uses.
 * ► All demo accounts: password = Admin@123
 */
@Component
@ConditionalOnProperty(name = "app.seed-data", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEMO_PASSWORD = "Admin@123";

    private final UserRepository      userRepository;
    private final AreaRepository      areaRepository;
    private final SlaConfigRepository slaConfigRepository;
    private final ComplaintRepository complaintRepository;
    private final CommentRepository   commentRepository;
    private final PasswordEncoder     passwordEncoder;
    private final CategoryRepository  categoryRepository;

    @PersistenceContext
    private EntityManager em;

    public DataSeeder(UserRepository userRepository, AreaRepository areaRepository,
                      SlaConfigRepository slaConfigRepository, ComplaintRepository complaintRepository,
                      CommentRepository commentRepository, PasswordEncoder passwordEncoder,
                      CategoryRepository categoryRepository) {
        this.userRepository = userRepository;
        this.areaRepository = areaRepository;
        this.slaConfigRepository = slaConfigRepository;
        this.complaintRepository = complaintRepository;
        this.commentRepository = commentRepository;
        this.passwordEncoder = passwordEncoder;
        this.categoryRepository = categoryRepository;
    }

    private void createSequencesIfNotExist() {
        String[] sequences = {
            "cw_user_c_seq", "cw_user_m_seq", "cw_user_s_seq", "cw_user_a_seq",
            "cw_complaint_seq", "cw_vote_seq", "cw_comment_seq",
            "cw_proof_seq", "cw_escalation_seq", "cw_notification_seq", "cw_audit_seq",
            "cw_application_seq", "cw_spam_seq"
        };
        for (String seq : sequences) {
            em.createNativeQuery("CREATE SEQUENCE IF NOT EXISTS " + seq + " START 1 INCREMENT 1").executeUpdate();
        }
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("DataSeeder: Starting data synchronization...");
        
        createSequencesIfNotExist();
        String hash = passwordEncoder.encode(DEMO_PASSWORD);
        seedAreas();
        seedCategories();
        seedStaff(hash); 

        log.info("DataSeeder: Synchronization completed successfully.");

        log.info("------------------------------------------------------");
        log.info("  CityWatch — Startup Check Complete");
        log.info("  Demo password for ALL accounts: {}", DEMO_PASSWORD);
        log.info("  Admin:       admin@citywatch.in");
        log.info("  Coordinator: gamerdani322@gmail.com");
        log.info("------------------------------------------------------");
    }

    // ─────────────────────────────────────────────────────────────────────────

    private void seedCategories() {
        for (com.citywatch.enums.Category enumCat : com.citywatch.enums.Category.values()) {
            Number count = (Number) em.createNativeQuery("SELECT count(*) FROM categories WHERE name = :name")
                .setParameter("name", enumCat.name())
                .getSingleResult();
            if (count.longValue() == 0) {
                int hours = switch (enumCat) {
                    case GARBAGE     -> 72;
                    case POTHOLE     -> 168;
                    case DRAINAGE    -> 96;
                    case STREETLIGHT -> 48;
                    case OTHER       -> 120;
                };
                categoryRepository.save(com.citywatch.entity.Category.builder()
                    .name(enumCat.name())
                    .description("Standard " + enumCat.name().toLowerCase() + " category")
                    .defaultSlaHours(hours)
                    .build());
            }
        }
    }

    private void seedAreas() {
        record AreaTuple(String name, double lat, double lng) {}
        List<AreaTuple> areas = List.of(
            new AreaTuple("Shivajinagar", 19.165, 77.305),
            new AreaTuple("CIDCO Colony",  19.125, 77.325),
            new AreaTuple("Vazirabad",     19.1538, 77.3130),
            new AreaTuple("Asarjan",       19.124, 77.285),
            new AreaTuple("Vishnupuri",    19.112, 77.289),
            new AreaTuple("Naganpura",     19.085, 77.321),
            new AreaTuple("New Nanded",    19.182, 77.312),
            new AreaTuple("Degloor Naka",  19.145, 77.340),
            new AreaTuple("Kasba",         19.162, 77.302),
            new AreaTuple("Huzur",         19.172, 77.315)
        );
        for (AreaTuple a : areas) {
            Number count = (Number) em.createNativeQuery("SELECT count(*) FROM areas WHERE name = :name")
                .setParameter("name", a.name())
                .getSingleResult();
            if (count.longValue() == 0) {
                areaRepository.save(
                    Area.builder()
                        .name(a.name()).city("Nanded")
                        .centerLat(a.lat()).centerLng(a.lng())
                        .build()
                );
            }
        }
    }

    private void seedStaff(String hash) {
        // ── Admin ────────────────────────────────────────────────────────────
        userRepository.findByEmail("admin@citywatch.in").ifPresentOrElse(
            u -> { u.setPassword(hash); userRepository.save(u); },
            () -> userRepository.save(User.builder()
                .id("MH16A0000001").username("admin")
                .email("admin@citywatch.in").password(hash)
                .role(Role.ADMIN).city("Nanded").stateCode("MH").rtoCode("16")
                .build())
        );

        // ── Coordinators ─────────────────────────────────────────────────────
        Area vazir = areaRepository.findByName("Vazirabad").orElse(null);

        String customCoordHash = passwordEncoder.encode("Coordinator@123");
        userRepository.findByEmail("gamerdani322@gmail.com").ifPresentOrElse(
            u -> { u.setPassword(customCoordHash); u.setFullName("Prakash Singh"); u.setUsername("prakash_s"); userRepository.save(u); },
            () -> userRepository.save(User.builder()
                .id("MH16M0000004").username("prakash_s").fullName("Prakash Singh")
                .email("gamerdani322@gmail.com").password(customCoordHash)
                .role(Role.COORDINATOR).area(vazir).city("Nanded").stateCode("MH").rtoCode("16")
                .build())
        );
        // ── Supervisors ─────────────────────────────────────────────────────
        String customSupHash = passwordEncoder.encode("Supervisor@123");
        userRepository.findByEmail("citywatch.india@gmail.com").ifPresentOrElse(
            u -> { u.setPassword(customSupHash); u.setFullName("CityWatch Supervisor"); u.setUsername("cw_supervisor"); userRepository.save(u); },
            () -> userRepository.save(User.builder()
                .id("MH16S0000001").username("cw_supervisor").fullName("CityWatch Supervisor")
                .email("citywatch.india@gmail.com").password(customSupHash)
                .role(Role.SUPERVISOR).area(vazir).city("Nanded").stateCode("MH").rtoCode("16")
                .build())
        );
    }
}
