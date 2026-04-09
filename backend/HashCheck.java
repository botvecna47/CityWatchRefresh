import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashCheck {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "Admin@123";
        String hash = "$2a$10$Y50UaMWM7p1S0mVLun9ZlepxqZ9P7tKjEaOnN2H5H3m1B5M2p6W3O";
        System.out.println("Matches: " + encoder.matches(password, hash));
    }
}
