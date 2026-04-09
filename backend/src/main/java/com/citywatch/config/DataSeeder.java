package com.citywatch.config;

import com.citywatch.entity.*;
import com.citywatch.enums.*;
import com.citywatch.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AreaRepository areaRepository;
    private final SlaConfigRepository slaConfigRepository;
    private final ComplaintRepository complaintRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Disabled: Use database/master_setup.sql for seeding instead.
        // This prevents 'IdentifierGenerationException' as Java code won't attempt 
        // to insert legacy 'Springfield' data without proper structured IDs.
    }

    private void seedAreas() {
        areaRepository.saveAll(List.of(
            Area.builder().name("North Area").city("Springfield").centerLat(40.7128).centerLng(-74.0060).build(),
            Area.builder().name("South Area").city("Springfield").centerLat(40.7100).centerLng(-74.0050).build(),
            Area.builder().name("East Area").city("Springfield").centerLat(40.7150).centerLng(-73.9990).build(),
            Area.builder().name("West Area").city("Springfield").centerLat(40.7110).centerLng(-74.0100).build()
        ));
    }

    private void seedSlaConfigs() {
        for (Category cat : Category.values()) {
            slaConfigRepository.findByCategory(cat).ifPresentOrElse(c -> {}, () -> {
                int hours = switch (cat) {
                    case GARBAGE -> 72;
                    case POTHOLE -> 168;
                    case DRAINAGE -> 96;
                    case STREETLIGHT -> 48;
                    case OTHER -> 120;
                };
                slaConfigRepository.save(SlaConfig.builder().category(cat).slaHours(hours).build());
            });
        }
    }

    private void seedUsers() {
        String pw = passwordEncoder.encode("password123");

        seedOrUpdate("admin@citywatch.com", pw, null, user -> {
            if (user == null) {
                userRepository.save(User.builder().username("carol_admin").email("admin@citywatch.com")
                    .password(pw).role(Role.ADMIN).city("Springfield").build());
            } else {
                user.setPassword(pw);
                userRepository.save(user);
            }
        });

        Area north = areaRepository.findByName("North Area").orElseThrow();
        Area south = areaRepository.findByName("South Area").orElseThrow();

        seedOrUpdate("bob@citywatch.com", pw, north, user -> {
            if (user == null) {
                userRepository.save(User.builder().username("bob_coordinator").email("bob@citywatch.com")
                    .password(pw).role(Role.COORDINATOR).area(north).city("Springfield").build());
            } else {
                user.setPassword(pw);
                userRepository.save(user);
            }
        });

        seedOrUpdate("dave@citywatch.com", pw, south, user -> {
            if (user == null) {
                userRepository.save(User.builder().username("dave_coordinator").email("dave@citywatch.com")
                    .password(pw).role(Role.COORDINATOR).area(south).city("Springfield").build());
            } else {
                user.setPassword(pw);
                userRepository.save(user);
            }
        });

        seedOrUpdate("alice@example.com", pw, null, user -> {
            if (user == null) {
                userRepository.save(User.builder().username("alice_citizen").email("alice@example.com")
                    .password(pw).role(Role.CITIZEN).city("Springfield").build());
            } else {
                user.setPassword(pw);
                userRepository.save(user);
            }
        });

        System.out.println("════════════════════════════════════════════════");
        System.out.println("✅ Users seeded. All passwords: password123");
        System.out.println("   Admin:       admin@citywatch.com");
        System.out.println("   Coordinator: bob@citywatch.com");
        System.out.println("   Coordinator: dave@citywatch.com");
        System.out.println("   Citizen:     alice@example.com");
        System.out.println("════════════════════════════════════════════════");
    }

    private void seedOrUpdate(String email, String pw, Area area, java.util.function.Consumer<User> action) {
        action.accept(userRepository.findByEmail(email).orElse(null));
    }

    private void seedComplaints() {
        User alice = userRepository.findByEmail("alice@example.com").orElseThrow();
        User bob = userRepository.findByEmail("bob@citywatch.com").orElseThrow();
        Area north = areaRepository.findByName("North Area").orElseThrow();
        Area south = areaRepository.findByName("South Area").orElseThrow();

        // Complaint 1 — In Progress
        Complaint c1 = complaintRepository.save(Complaint.builder()
            .citizen(alice)
            .area(north)
            .category(Category.POTHOLE)
            .description("There is a massive pothole near the central intersection at Main Street. It has been growing for weeks after the rain and is causing damage to vehicles. Requires urgent repair before someone is injured.")
            .imageUrls(java.util.List.of("https://images.unsplash.com/photo-1667317980667-9d5ed99f829e?w=600"))
            .latitude(40.7128)
            .longitude(-74.0060)
            .status(ComplaintStatus.IN_PROGRESS)
            .assignedCoordinator(bob)
            .intensityScore(2.3)
            .priority(Priority.HIGH)
            .slaDeadline(LocalDateTime.now().plusHours(72))
            .build());

        commentRepository.save(Comment.builder()
            .complaint(c1).user(bob)
            .content("We have dispatched a team to assess the damage. Work is scheduled to begin tomorrow morning.")
            .build());
        commentRepository.save(Comment.builder()
            .complaint(c1).user(alice)
            .content("Thank you! It has been very dangerous at night, especially for motorcycles.")
            .build());

        // Complaint 2 — Pending Review
        complaintRepository.save(Complaint.builder()
            .citizen(alice)
            .area(south)
            .category(Category.STREETLIGHT)
            .description("The streetlight on Oak Avenue near the school has been broken for two weeks. The area is completely dark after 7pm and it is very unsafe for children walking home from evening activities.")
            .imageUrls(java.util.List.of("https://images.unsplash.com/photo-1765300012968-2c4ceb1d99c4?w=600"))
            .latitude(40.7100)
            .longitude(-74.0050)
            .status(ComplaintStatus.PENDING_REVIEW)
            .intensityScore(0.8)
            .priority(Priority.MEDIUM)
            .build());

        // Complaint 3 — Completed
        complaintRepository.save(Complaint.builder()
            .citizen(alice)
            .area(north)
            .category(Category.GARBAGE)
            .description("Overflowing garbage bins at the corner of Park Lane — garbage piling up on the sidewalk for 5 days. The smell is affecting nearby residents and attracting pests. Sanitation last visited 3 weeks ago.")
            .imageUrls(java.util.List.of("https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600"))
            .latitude(40.7135)
            .longitude(-74.0065)
            .status(ComplaintStatus.COMPLETED)
            .assignedCoordinator(bob)
            .intensityScore(1.1)
            .priority(Priority.MEDIUM)
            .slaDeadline(LocalDateTime.now().plusHours(10))
            .build());

        // Complaint 4 — Approved (no coordinator yet)
        complaintRepository.save(Complaint.builder()
            .citizen(alice)
            .area(north)
            .category(Category.DRAINAGE)
            .description("The drain at Green Street is completely blocked after last week's rain. Stagnant water is flooding the road and pavement. Several residents have complained. This needs immediate attention before the next rainfall.")
            .imageUrls(java.util.List.of("https://images.unsplash.com/photo-1546198632-9ef6368bef12?w=600"))
            .latitude(40.7120)
            .longitude(-74.0055)
            .status(ComplaintStatus.APPROVED)
            .intensityScore(1.6)
            .priority(Priority.HIGH)
            .slaDeadline(LocalDateTime.now().plusHours(48))
            .build());

        System.out.println("✅ Sample complaints seeded (4 complaints, 2 comments)");
    }
}
