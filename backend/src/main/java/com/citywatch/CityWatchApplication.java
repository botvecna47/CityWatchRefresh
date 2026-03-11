package com.citywatch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CityWatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(CityWatchApplication.class, args);
    }

}
