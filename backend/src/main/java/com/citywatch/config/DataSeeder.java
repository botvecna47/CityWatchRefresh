package com.citywatch.config;

import com.citywatch.entity.*;
import com.citywatch.enums.*;
import com.citywatch.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEMO_PASSWORD = "Admin@123";

    private final UserRepository      userRepository;
    private final AreaRepository      areaRepository;
    private final SlaConfigRepository slaConfigRepository;
    private final ComplaintRepository complaintRepository;
    private final CommentRepository   commentRepository;
    private final PasswordEncoder     passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Encode at runtime — guaranteed compatible with the BCrypt version in pom.xml
        String hash = passwordEncoder.encode(DEMO_PASSWORD);

        seedSlaConfigs();
        seedAreas();
        seedStaff(hash); // Always sync Admin and Coordinators

        // Only seed demo data (Citizens & Complaints) if the database is "empty" of citizens
        if (userRepository.findByRole(Role.CITIZEN).isEmpty()) {
            seedDemoCitizens(hash);
            seedComplaints();
        } else {
            log.info("DataSeeder: Existing citizens found. Skipping demo data seeding.");
        }

        log.info("------------------------------------------------------");
        log.info("  CityWatch — Startup Check Complete");
        log.info("  Demo password for ALL accounts: {}", DEMO_PASSWORD);
        log.info("  Admin:       admin@citywatch.in");
        log.info("  Coordinator: ravi@citywatch.in");
        log.info("  Coordinator: sunita@citywatch.in");
        log.info("------------------------------------------------------");
    }

    // ─────────────────────────────────────────────────────────────────────────

    private void seedSlaConfigs() {
        for (Category cat : Category.values()) {
            slaConfigRepository.findByCategory(cat).ifPresentOrElse(
                c -> { /* already exists — skip */ },
                () -> {
                    int hours = switch (cat) {
                        case GARBAGE     -> 72;
                        case POTHOLE     -> 168;
                        case DRAINAGE    -> 96;
                        case STREETLIGHT -> 48;
                        case OTHER       -> 120;
                    };
                    slaConfigRepository.save(
                        SlaConfig.builder().category(cat).slaHours(hours).build()
                    );
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

        if (citizen1 == null || vazir == null) {
            log.warn("DataSeeder: skipping complaint seed — required user/area not found");
            return;
        }

        // --- ID 1: Pothole (Market) — HIGH ---
        seedOrUpdate(
            "CMP-100426-000001", citizen1, vazir, Category.POTHOLE,
            "Large pothole near Vazirabad main market has caused two motorcycle accidents this week. Road is broken near the junction.",
            19.1535, 77.3128, ComplaintStatus.IN_PROGRESS, ravi, Priority.HIGH
        );

        // --- ID 2: Garbage (Square) — HIGH ---
        seedOrUpdate(
            "CMP-100426-000002", citizen2, vazir, Category.GARBAGE,
            "Garbage pile-up near Vazirabad Square main gate — bins not cleared for 6 days. Foul smell affecting the entire market block.",
            19.1542, 77.3140, ComplaintStatus.ASSIGNED, sunita, Priority.HIGH
        );

        // --- ID 3: Streetlight (Rear Lane) — MEDIUM ---
        seedOrUpdate(
            "CMP-100426-000003", citizen3, vazir, Category.STREETLIGHT,
            "Entire lane behind the main residential complex has no working streetlights since last week. Safety risk at night.",
            19.1528, 77.3145, ComplaintStatus.PENDING_REVIEW, null, Priority.MEDIUM
        );

        // --- ID 4: Drainage (Post Office) — HIGH ---
        seedOrUpdate(
            "CMP-100426-000004", citizen1, vazir, Category.DRAINAGE,
            "Blocked storm drain near Vazirabad Post Office — stagnant water overflowing onto road. Residents are worried about health hazards.",
            19.1550, 77.3115, ComplaintStatus.ASSIGNED, ravi, Priority.HIGH
        );

        // --- ID 5: Garbage (Construction) — MEDIUM ---
        seedOrUpdate(
            "CMP-100426-000005", citizen2, vazir, Category.GARBAGE,
            "Illegal dumping of construction debris and waste on the footpath near Vazirabad colony entrance.",
            19.1515, 77.3105, ComplaintStatus.PENDING_REVIEW, null, Priority.MEDIUM
        );

        // --- ID 6: Pothole (Naka) — MEDIUM ---
        seedOrUpdate(
            "CMP-100426-000006", citizen1, vazir, Category.POTHOLE,
            "Series of small potholes making the commute very bumpy near Vazirabad Naka junction. Several vehicles damaged.",
            19.1565, 77.3170, ComplaintStatus.ASSIGNED, sunita, Priority.MEDIUM
        );

        // --- ID 7: Streetlight (Intersection) — LOW ---
        seedOrUpdate(
            "CMP-100426-000007", citizen3, vazir, Category.STREETLIGHT,
            "Blinking/flickering streetlight at the Vazirabad main intersection is very distracting for drivers at night.",
            19.1548, 77.3132, ComplaintStatus.PENDING_REVIEW, null, Priority.LOW
        );

        // --- ID 8: Drainage (Residential) — HIGH ---
        seedOrUpdate(
            "CMP-100426-000008", citizen2, vazir, Category.DRAINAGE,
            "Foul smell and overflow from the open drain near the residential colony in Vazirabad. Drain has not been cleaned in months.",
            19.1502, 77.3120, ComplaintStatus.ASSIGNED, ravi, Priority.HIGH
        );

        // --- ID 9: Pothole (Pipeline) — MEDIUM ---
        seedOrUpdate(
            "CMP-100426-000009", citizen1, vazir, Category.POTHOLE,
            "Deep crater formed after recent pipeline repair work near Vazirabad water tank. Road surface not restored properly.",
            19.1558, 77.3152, ComplaintStatus.PENDING_REVIEW, null, Priority.MEDIUM
        );

        // --- ID 10: Other (Parking) — LOW ---
        seedOrUpdate(
            "CMP-100426-000010", citizen3, vazir, Category.OTHER,
            "Unauthorised vehicles parked daily at the main entry gate of Vazirabad colony, blocking movement for residents.",
            19.1538, 77.3130, ComplaintStatus.PENDING_REVIEW, null, Priority.LOW
        );

        Complaint c1 = complaintRepository.findById("CMP-100426-000001").get();
        if (ravi != null && commentRepository.count() == 0) {
            commentRepository.save(Comment.builder()
                .id("CMT-100426-000001").complaint(c1).user(ravi)
                .content("Team dispatched to assess road damage. Repair work begins tomorrow morning.")
                .build());
        }

        log.info("DataSeeder: 10 sample complaints synchronized in Vazirabad.");
    }

    private void seedOrUpdate(String id, User citizen, Area area, Category category, String desc,
                               double lat, double lng, ComplaintStatus status, User coordinator, Priority priority) {
        complaintRepository.findById(id).ifPresentOrElse(
            c -> {
                c.setArea(area);
                c.setLatitude(lat);
                c.setLongitude(lng);
                c.setDescription(desc);
                c.setPriority(priority);
                complaintRepository.save(c);
            },
            () -> complaintRepository.save(Complaint.builder()
                .id(id).citizen(citizen).area(area)
                .category(category).description(desc)
                .latitude(lat).longitude(lng)
                .status(status).intensityScore(priority == Priority.HIGH ? 3.5 : priority == Priority.MEDIUM ? 1.5 : 0.5)
                .priority(priority)
                .assignedCoordinator(coordinator)
                .slaDeadline(LocalDateTime.now().plusDays(5))
                .build())
        );
    }
}

        User citizen3 = userRepository.findByEmail("c3@gmail.com").orElse(null);
