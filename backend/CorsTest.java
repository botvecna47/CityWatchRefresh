import org.springframework.web.cors.CorsConfiguration;
import java.util.Arrays;
import java.util.List;

public class CorsTest {
    public static void main(String[] args) {
        try {
            CorsConfiguration configuration = new CorsConfiguration();
            String allowedOriginsStr = "*";
            List<String> origins = Arrays.asList(allowedOriginsStr.split(","));
            if (origins.contains("*")) {
                configuration.setAllowedOriginPatterns(List.of("*"));
            } else {
                configuration.setAllowedOrigins(origins);
            }
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
            configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
            configuration.setAllowCredentials(true);
            configuration.setMaxAge(3600L);
            
            System.out.println("Config created successfully.");
            
            String origin = "http://localhost:5173";
            String result = configuration.checkOrigin(origin);
            System.out.println("Result: " + result);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
