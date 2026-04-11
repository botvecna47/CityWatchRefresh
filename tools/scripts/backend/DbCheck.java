import java.sql.*;
import java.util.Properties;

public class DbCheck {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require";
        Properties props = new Properties();
        props.setProperty("user", "postgres.axtcsaknntdxhzxwzvmo");
        props.setProperty("password", "botvecna@47");
        props.setProperty("ssl", "true");
        props.setProperty("sslmode", "require");

        try (Connection conn = DriverManager.getConnection(url, props)) {
            System.out.println("Connected to database!");
            
            try (Statement stmt = conn.createStatement()) {
                // Check Areas
                try (ResultSet rs = stmt.executeQuery("SELECT count(*) FROM areas")) {
                    if (rs.next()) System.out.println("Area count: " + rs.getInt(1));
                }
                
                // Check Users
                System.out.println("\nListing Users:");
                try (ResultSet rs = stmt.executeQuery("SELECT email, role, city FROM users")) {
                    while (rs.next()) {
                        System.out.println("- " + rs.getString("email") + " | " + rs.getString("role") + " | " + rs.getString("city"));
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
