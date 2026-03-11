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
        if (userRepository.count() == 0) {
            seedAreas();
            seedUsers();
        }
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
                .build()
        );
        areaRepository.saveAll(areas);
    }

    private void seedUsers() {
        Area northArea = areaRepository.findByName("North Area").orElseThrow();

        List<User> users = List.of(
            User.builder()
                .username("admin_master")
                .email("admin@citywatch.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .city("Springfield")
                .build(),
            User.builder()
                .username("coordinator_alex")
                .email("coordinator@citywatch.com")
                .password(passwordEncoder.encode("coord123"))
                .role(Role.COORDINATOR)
                .area(northArea)
                .city("Springfield")
                .build(),
            User.builder()
                .username("citizen_john")
                .email("citizen@citywatch.com")
                .password(passwordEncoder.encode("citizen123"))
                .role(Role.CITIZEN)
                .city("Springfield")
                .build()
        );
        userRepository.saveAll(users);
        System.out.println("✅ Data seeded successfully! Accounts created: admin@citywatch.com, coordinator@citywatch.com, citizen@citywatch.com");
    }
}
