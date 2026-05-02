import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class BucketSetup {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require";
        String user = "postgres.zutdbxtzwaktrrfjtetg";
        String password = "botvecna_47";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            System.out.println("Connected to Supabase PostgreSQL.");

            // 1. Create the bucket
            String insertBucket = "INSERT INTO storage.buckets (id, name, public) " +
                                  "VALUES ('citywatch-images', 'citywatch-images', true) " +
                                  "ON CONFLICT (id) DO NOTHING;";
            stmt.execute(insertBucket);
            System.out.println("Bucket 'citywatch-images' created or already exists.");

            // 2. Allow public read access
            String policyRead = "CREATE POLICY \"Public Access\" ON storage.objects FOR SELECT USING (bucket_id = 'citywatch-images');";
            try { stmt.execute(policyRead); } catch (Exception e) { System.out.println("Policy (Read) may already exist."); }

            // 3. Allow public insert access
            String policyInsert = "CREATE POLICY \"Public Insert\" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'citywatch-images');";
            try { stmt.execute(policyInsert); } catch (Exception e) { System.out.println("Policy (Insert) may already exist."); }

            System.out.println("Bucket setup completed successfully.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
