import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require";
        String user = "postgres.zutdbxtzwaktrrfjtetg";
        String pass = "botvecna_47";
        
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT id, username, role, status FROM users")) {
             
            while (rs.next()) {
                System.out.println(rs.getString("id") + " | " + rs.getString("username") + " | " + rs.getString("role") + " | " + rs.getString("status"));
            }
        }
    }
}
