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
            "cw_user_c_seq", "cw_user_m_seq", "cw_user_a_seq",
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
        seedStaff(hash); // Always sync Admin and Coordinators

        long citizenCount = userRepository.findByRole(Role.CITIZEN).size();
        log.info("DataSeeder: Found {} existing citizens.", citizenCount);

        if (citizenCount == 0) {
            log.info("DataSeeder: No citizens found. Seeding demo citizens...");
            seedDemoCitizens(hash);
        }
        
        long complaintCount = complaintRepository.count();
        log.info("DataSeeder: Found {} existing complaints. Syncing all...", complaintCount);
        seedComplaints(); // always run to keep titles/statuses up to date

        log.info("DataSeeder: Synchronization completed successfully.");

        log.info("------------------------------------------------------");
        log.info("  CityWatch — Startup Check Complete");
        log.info("  Demo password for ALL accounts: {}", DEMO_PASSWORD);
        log.info("  Admin:       admin@citywatch.in");
        log.info("  Coordinator: ravi@citywatch.in");
        log.info("  Coordinator: sunita@citywatch.in");
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

    /**
     * Synchronizes Admin and coordinator accounts. Always ensures they exist and
     * have the correct demo password for testing.
     */
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
        Area shivaji = areaRepository.findByName("Shivajinagar").orElse(null);
        Area cidco   = areaRepository.findByName("CIDCO Colony").orElse(null);

        userRepository.findByEmail("ravi@citywatch.in").ifPresentOrElse(
            u -> { u.setPassword(hash); userRepository.save(u); },
            () -> userRepository.save(User.builder()
                .id("MH16M0000001").username("ravi_p")
                .email("ravi@citywatch.in").password(hash)
                .role(Role.COORDINATOR).area(shivaji).city("Nanded").stateCode("MH").rtoCode("16")
                .build())
        );
        userRepository.findByEmail("sunita@citywatch.in").ifPresentOrElse(
            u -> { u.setPassword(hash); userRepository.save(u); },
            () -> userRepository.save(User.builder()
                .id("MH16M0000002").username("sunita_d")
                .email("sunita@citywatch.in").password(hash)
                .role(Role.COORDINATOR).area(cidco).city("Nanded").stateCode("MH").rtoCode("16")
                .build())
        );
    }

    /**
     * Seeds the standard 5 demo citizens. Only called if the DB has no citizens.
     */
    private void seedDemoCitizens(String hash) {
        log.info("DataSeeder: Seeding 5 demo citizens...");
        for (int i = 1; i <= 5; i++) {
            final String email = "c" + i + "@gmail.com";
            final String uid   = String.format("MH16C%07d", i);
            final String uname = "citizen" + i;
            userRepository.findByEmail(email).ifPresentOrElse(
                u -> { u.setPassword(hash); userRepository.save(u); },
                () -> userRepository.save(User.builder()
                    .id(uid).username(uname)
                    .email(email).password(hash)
                    .role(Role.CITIZEN).city("Nanded").stateCode("MH").rtoCode("16")
                    .build())
            );
        }
    }

    private void seedComplaints() {
        User citizen1 = userRepository.findByEmail("c1@gmail.com").orElse(null);
        User citizen2 = userRepository.findByEmail("c2@gmail.com").orElse(null);
        User citizen3 = userRepository.findByEmail("c3@gmail.com").orElse(null);
        User ravi     = userRepository.findByEmail("ravi@citywatch.in").orElse(null);
        User sunita   = userRepository.findByEmail("sunita@citywatch.in").orElse(null);

        Area vazir = areaRepository.findByName("Vazirabad").orElse(null);
        Area shivaji = areaRepository.findByName("Shivajinagar").orElse(null);
        
        com.citywatch.entity.Category pothole = categoryRepository.findByName("POTHOLE").orElse(null);
        com.citywatch.entity.Category garbage = categoryRepository.findByName("GARBAGE").orElse(null);
        com.citywatch.entity.Category street = categoryRepository.findByName("STREETLIGHT").orElse(null);
        com.citywatch.entity.Category drainage = categoryRepository.findByName("DRAINAGE").orElse(null);
        com.citywatch.entity.Category other = categoryRepository.findByName("OTHER").orElse(null);

        if (citizen1 == null || vazir == null || shivaji == null || pothole == null) {
            log.warn("DataSeeder: skipping complaint seed — required user/area/category not found");
            return;
        }

        // --- ID 1: Pothole 1 ---
        seedOrUpdate(
            "CMP-100426-000001", citizen1, vazir, pothole,
            "Deep pothole on main market road",
            "There's a massive pothole in the middle of Vazirabad market causing severe traffic jams.",
            19.1535, 77.3128, ComplaintStatus.IN_PROGRESS, ravi, Priority.HIGH,
            new ArrayList<>(List.of("/uploads/Potholes1.jpg"))
        );

        // --- ID 2: Garbage 1 ---
        seedOrUpdate(
            "CMP-100426-000002", citizen2, vazir, garbage,
            "Garbage pile near square",
            "Garbage not cleared for 6 days. Foul smell affecting everyone.",
            19.1542, 77.3140, ComplaintStatus.ASSIGNED, sunita, Priority.HIGH,
            new ArrayList<>(List.of("/uploads/Garbage1.jpg"))
        );

        // --- ID 3: Drainage 1 ---
        seedOrUpdate(
            "CMP-100426-000003", citizen3, vazir, drainage,
            "Water pipeline burst",
            "Massive water leak near the rear residential lane. Clean water is being wasted.",
            19.1528, 77.3145, ComplaintStatus.PENDING_REVIEW, null, Priority.MEDIUM,
            new ArrayList<>(List.of("/uploads/Waterleak1.jpg"))
        );

        // --- ID 4: Garbage 2 ---
        seedOrUpdate(
            "CMP-100426-000004", citizen1, vazir, garbage,
            "Dumpyard overflowing onto road",
            "The community bin near the post office is overflowing onto the street.",
            19.1550, 77.3115, ComplaintStatus.ASSIGNED, ravi, Priority.HIGH,
            new ArrayList<>(List.of("/uploads/garbage2.jpg"))
        );

        // --- ID 5: Pothole 2 ---
        seedOrUpdate(
            "CMP-100426-000005", citizen2, shivaji, pothole,
            "Broken road near school",
            "Dangerous potholes right outside the primary school entrance.",
            19.1555, 77.3075, ComplaintStatus.PENDING_REVIEW, null, Priority.HIGH,
            new ArrayList<>(List.of("/uploads/Potholes2.jpg"))
        );

        // --- ID 6: Garbage 3 ---
        seedOrUpdate(
            "CMP-100426-000006", citizen3, shivaji, garbage,
            "Plastic waste accumulation",
            "Empty plot has become a dumping ground for plastic waste.",
            19.1560, 77.3080, ComplaintStatus.PENDING_REVIEW, null, Priority.MEDIUM,
            new ArrayList<>(List.of("/uploads/Garbage3.jpg"))
        );

        // --- ID 7: Pothole 3 ---
        seedOrUpdate(
            "CMP-100426-000007", citizen1, vazir, pothole,
            "Road caved in",
            "A section of the road has completely caved in near the junction.",
            19.1565, 77.3135, ComplaintStatus.IN_PROGRESS, ravi, Priority.CRITICAL,
            new ArrayList<>(List.of("/uploads/Pothole3.webp"))
        );

        // --- ID 8: Pothole 4 ---
        seedOrUpdate(
            "CMP-100426-000008", citizen2, vazir, pothole,
            "Continuous stretch of bad roads",
            "The entire street is filled with small and large potholes.",
            19.1570, 77.3140, ComplaintStatus.ASSIGNED, sunita, Priority.MEDIUM,
            new ArrayList<>(List.of("/uploads/Pothole4.jpg"))
        );

        // --- ID 9: Pothole 5 ---
        seedOrUpdate(
            "CMP-100426-000009", citizen3, shivaji, pothole,
            "Monsoon road damage",
            "Recent rains washed away the top layer. Needs immediate tarring.",
            19.1580, 77.3090, ComplaintStatus.PENDING_REVIEW, null, Priority.LOW,
            new ArrayList<>(List.of("/uploads/Potholes.jpg"))
        );

        // --- ID 10: Drainage 2 ---
        seedOrUpdate(
            "CMP-100426-000010", citizen1, vazir, drainage,
            "Sewer line blocked",
            "Blocked sewer line causing dirty water to back up onto the pavement.",
            19.1590, 77.3150, ComplaintStatus.ASSIGNED, sunita, Priority.HIGH,
            new ArrayList<>(List.of("/uploads/waterleak3.jpg"))
        );

        // --- ID 11: Garbage 4 ---
        seedOrUpdate(
            "CMP-100426-000011", citizen2, shivaji, garbage,
            "Construction debris dumped",
            "Someone dumped construction debris illegally on the roadside.",
            19.1595, 77.3100, ComplaintStatus.PENDING_REVIEW, null, Priority.MEDIUM,
            new ArrayList<>(List.of("/uploads/garbabe4"))
        );

        // --- ID 12: Drainage 3 ---
        seedOrUpdate(
            "CMP-100426-000012", citizen3, vazir, drainage,
            "Continuous water leakage",
            "Underground pipe leak forming a puddle that breeds mosquitoes.",
            19.1600, 77.3160, ComplaintStatus.IN_PROGRESS, ravi, Priority.HIGH,
            new ArrayList<>(List.of("/uploads/Waterleak2.jpg"))
        );

        Complaint c1 = complaintRepository.findById("CMP-100426-000001").orElse(null);
        if (ravi != null && c1 != null && commentRepository.count() == 0) {
            commentRepository.save(Comment.builder()
                .id("CMT-100426-000001").complaint(c1).user(ravi)
                .content("Team dispatched to assess road damage. Repair work begins tomorrow morning.")
                .build());
        }

        log.info("DataSeeder: 12 sample complaints synchronized.");
    }

    private void seedOrUpdate(String id, User citizen, Area area, com.citywatch.entity.Category category, String title, String desc,
                               double lat, double lng, ComplaintStatus status, User coordinator, Priority priority,
                               List<String> imageUrls) {
        Number count = (Number) em.createNativeQuery("SELECT count(*) FROM complaints WHERE id = :id")
                .setParameter("id", id)
                .getSingleResult();
        if (count.longValue() > 0) {
            // Update metadata only if the complaint is still active (not soft-deleted)
            complaintRepository.findById(id).ifPresent(c -> {
                c.setArea(area);
                c.setLatitude(lat);
                c.setLongitude(lng);
                c.setTitle(title);
                c.setDescription(desc);
                c.setPriority(priority);
                c.setStatus(status);
                c.setImageUrls(imageUrls);
                c.setAssignedCoordinator(coordinator);
                c.setIntensityScore(priority == Priority.HIGH ? 3.5 : priority == Priority.MEDIUM ? 1.5 : 0.5);
                complaintRepository.save(c);
            });
        } else {
            // Does not exist at all, safe to insert
            complaintRepository.save(Complaint.builder()
                .id(id).citizen(citizen).area(area)
                .category(category).title(title).description(desc)
                .latitude(lat).longitude(lng)
                .status(status).intensityScore(priority == Priority.HIGH ? 3.5 : priority == Priority.MEDIUM ? 1.5 : 0.5)
                .priority(priority)
                .assignedCoordinator(coordinator)
                .imageUrls(imageUrls)
                .slaDeadline(LocalDateTime.now().plusDays(5))
                .build());
        }
    }
}
