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

/**
 * DataSeeder — Idempotent startup seeder for CityWatch Nanded demo data.
 *
 * ► Runs on EVERY startup (safe — checks before inserting).
 * ► ALWAYS force-resets demo-account passwords so they stay in sync with
 *   whatever BCrypt format the current Spring Security version uses.
 * ► All demo accounts: password = Admin@123
 */
@Component
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
            categoryRepository.findByName(enumCat.name()).ifPresentOrElse(
                c -> { /* already exists */ },
                () -> {
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
            );
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
            if (areaRepository.findByName(a.name()).isEmpty()) {
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

        // --- ID 1: Pothole (Market) — HIGH ---
        seedOrUpdate(
            "CMP-100426-000001", citizen1, vazir, pothole,
            "Large pothole in Vazirabad Market",
            "Large pothole near Vazirabad main market has caused two motorcycle accidents this week. Road is broken near the junction.",
            19.1535, 77.3128, ComplaintStatus.IN_PROGRESS, ravi, Priority.HIGH,
            new ArrayList<>(List.of("https://images.unsplash.com/photo-1594495024543-7496797a396e?w=600"))
        );

        // --- ID 2: Garbage (Square) — HIGH ---
        seedOrUpdate(
            "CMP-100426-000002", citizen2, vazir, garbage,
            "Overflowing garbage at Vazirabad Square",
            "Garbage pile-up near Vazirabad Square main gate — bins not cleared for 6 days. Foul smell affecting the entire market block.",
            19.1542, 77.3140, ComplaintStatus.ASSIGNED, sunita, Priority.HIGH,
            new ArrayList<>(List.of("https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600"))
        );

        // --- ID 3: Streetlight (Rear Lane) — MEDIUM ---
        seedOrUpdate(
            "CMP-100426-000003", citizen3, vazir, street,
            "Broken streetlights in residential lane",
            "Entire lane behind the main residential complex has no working streetlights since last week. Safety risk at night.",
            19.1528, 77.3145, ComplaintStatus.PENDING_REVIEW, null, Priority.MEDIUM,
            new ArrayList<>(List.of("https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=600"))
        );

        // --- ID 4: Drainage (Post Office) — HIGH ---
        seedOrUpdate(
            "CMP-100426-000004", citizen1, vazir, drainage,
            "Blocked storm drain near Post Office",
            "Blocked storm drain near Vazirabad Post Office — stagnant water overflowing onto road. Residents are worried about health hazards.",
            19.1550, 77.3115, ComplaintStatus.ASSIGNED, ravi, Priority.HIGH,
            new ArrayList<>(List.of("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600"))
        );

        // --- ID 5: Shivajinagar Issue with LOCAL ICON ---
        seedOrUpdate(
            "CMP-100426-000005", citizen1, shivaji, other,
            "Local Image Test Issue",
            "This complaint uses the local /favicon.png to test if local image loading works correctly.",
            19.1555, 77.3075, ComplaintStatus.PENDING_REVIEW, null, Priority.LOW,
            new ArrayList<>(List.of("/favicon.png"))
        );

        Complaint c1 = complaintRepository.findById("CMP-100426-000001").get();
        if (ravi != null && commentRepository.count() == 0) {
            commentRepository.save(Comment.builder()
                .id("CMT-100426-000001").complaint(c1).user(ravi)
                .content("Team dispatched to assess road damage. Repair work begins tomorrow morning.")
                .build());
        }

        log.info("DataSeeder: 5 sample complaints synchronized (4 Vazirabad, 1 Shivajinagar).");
    }

    private void seedOrUpdate(String id, User citizen, Area area, com.citywatch.entity.Category category, String title, String desc,
                               double lat, double lng, ComplaintStatus status, User coordinator, Priority priority,
                               List<String> imageUrls) {
        complaintRepository.findById(id).ifPresentOrElse(
            c -> {
                // Always update metadata so DB stays in sync with seeder
                c.setArea(area);
                c.setLatitude(lat);
                c.setLongitude(lng);
                c.setTitle(title);           // fix null titles
                c.setDescription(desc);
                c.setPriority(priority);
                c.setStatus(status);         // keep demo status correct
                c.setImageUrls(imageUrls);
                c.setAssignedCoordinator(coordinator);
                c.setIntensityScore(priority == Priority.HIGH ? 3.5 : priority == Priority.MEDIUM ? 1.5 : 0.5);
                complaintRepository.save(c);
            },
            () -> complaintRepository.save(Complaint.builder()
                .id(id).citizen(citizen).area(area)
                .category(category).title(title).description(desc)
                .latitude(lat).longitude(lng)
                .status(status).intensityScore(priority == Priority.HIGH ? 3.5 : priority == Priority.MEDIUM ? 1.5 : 0.5)
                .priority(priority)
                .assignedCoordinator(coordinator)
                .imageUrls(imageUrls)
                .slaDeadline(LocalDateTime.now().plusDays(5))
                .build())
        );
    }
}
