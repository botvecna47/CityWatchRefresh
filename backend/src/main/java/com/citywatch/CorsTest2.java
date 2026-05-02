import org.springframework.web.cors.CorsConfiguration;
import java.util.Arrays;
import java.util.List;

public class CorsTest2 {
    public static void main(String[] args) {
        try {
            CorsConfiguration configuration = new CorsConfiguration();
            String origin = "https://city-watch-refresh-6924-eemglig2y-botvecna47s-projects.vercel.app";
            configuration.setAllowedOrigins(Arrays.asList(origin));
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
            configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
            configuration.setAllowCredentials(true);
            configuration.setMaxAge(3600L);
            
            System.out.println("Config checked origin: " + configuration.checkOrigin(origin));
            
            configuration = new CorsConfiguration();
            configuration.setAllowedOriginPatterns(Arrays.asList("*"));
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
            configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
            configuration.setAllowCredentials(true);
            System.out.println("Pattern checked origin: " + configuration.checkOrigin(origin));
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
