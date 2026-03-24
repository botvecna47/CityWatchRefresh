package com.citywatch.config;

import com.citywatch.entity.Area;
import com.citywatch.entity.User;
import com.citywatch.enums.Role;
import com.citywatch.repository.AreaRepository;
import com.citywatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AreaRepository areaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (areaRepository.count() == 0) {
            seedAreas();
        }
        seedUsers();
    }

    private void seedAreas() {
        List<Area> areas = List.of(
            Area.builder()
                .name("North Area")
                .city("Springfield")
                .centerLat(40.7128)
                .centerLng(-74.0060)
                .build(),
            Area.builder()
                .name("South Area")
                .city("Springfield")
                .centerLat(40.7100)
                .centerLng(-74.0050)
                .build(),
            Area.builder()
                .name("East Area")
                .city("Springfield")
                .centerLat(40.7150)
                .centerLng(-73.9990)
                .build(),
            Area.builder()
                .name("West Area")
                .city("Springfield")
                .centerLat(40.7110)
                .centerLng(-74.0100)
                .build()
        );
        areaRepository.saveAll(areas);
    }

    private void seedUsers() {
        Area northArea = areaRepository.findByName("North Area").orElseThrow();
        Area southArea = areaRepository.findByName("South Area").orElseThrow();

        String encodedPassword = passwordEncoder.encode("password123");

        userRepository.findByEmail("admin@citywatch.com").ifPresentOrElse(user -> {
            user.setPassword(encodedPassword);
            userRepository.save(user);
        }, () -> {
            userRepository.save(User.builder()
                .username("carol_admin")
                .email("admin@citywatch.com")
                .password(encodedPassword)
                .role(Role.ADMIN)
                .city("Springfield")
                .build());
        });

        userRepository.findByEmail("bob@citywatch.com").ifPresentOrElse(user -> {
            user.setPassword(encodedPassword);
            userRepository.save(user);
        }, () -> {
            userRepository.save(User.builder()
                .username("bob_coordinator")
                .email("bob@citywatch.com")
                .password(encodedPassword)
                .role(Role.COORDINATOR)
                .area(northArea)
                .city("Springfield")
                .build());
        });

        userRepository.findByEmail("dave@citywatch.com").ifPresentOrElse(user -> {
            user.setPassword(encodedPassword);
            userRepository.save(user);
        }, () -> {
            userRepository.save(User.builder()
                .username("dave_coordinator")
                .email("dave@citywatch.com")
                .password(encodedPassword)
                .role(Role.COORDINATOR)
                .area(southArea)
                .city("Springfield")
                .build());
        });

        userRepository.findByEmail("alice@example.com").ifPresentOrElse(user -> {
            user.setPassword(encodedPassword);
            userRepository.save(user);
        }, () -> {
            userRepository.save(User.builder()
                .username("alice_citizen")
                .email("alice@example.com")
                .password(encodedPassword)
                .role(Role.CITIZEN)
                .city("Springfield")
                .build());
        });

        System.out.println("════════════════════════════════════════════════");
        System.out.println("✅ Test accounts seeded! All passwords: password123");
        System.out.println("   🛡️  Admin:       admin@citywatch.com");
        System.out.println("   🔧 Coordinator: bob@citywatch.com");
        System.out.println("   🔧 Coordinator: dave@citywatch.com");
        System.out.println("   🧑 Citizen:     alice@example.com");
        System.out.println("════════════════════════════════════════════════");
    }
}
