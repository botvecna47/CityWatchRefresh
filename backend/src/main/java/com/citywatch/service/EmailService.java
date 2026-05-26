package com.citywatch.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * EmailService — Sends branded HTML notification emails to CityWatch users.
 * Degrades gracefully: if SMTP is not configured, it logs a warning and skips.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    /**
     * Sends a notification email asynchronously so it never blocks the main thread.
     */
    @Async
    public void sendNotificationEmail(String toEmail, String toName, String subject, String title, String body) {
        if (mailSender == null || smtpUsername == null || smtpUsername.isBlank()) {
            log.warn("[EmailService] SMTP not configured — skipping email to {}", toEmail);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(smtpUsername, "CityWatch");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(buildHtml(toName, title, body), true);
            mailSender.send(message);
            log.info("[EmailService] Notification email sent to {}", toEmail);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.warn("[EmailService] Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildHtml(String name, String title, String body) {
        String uniqueRef = java.util.UUID.randomUUID().toString().substring(0, 8);
        String currentDateTime = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"));
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>CityWatch Notification</title>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
            </head>
            <body style="margin:0;padding:0;background-color:#FDFDF7;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#FDFDF7;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e6e2;max-width:560px;width:100%%;box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                      
                      <!-- Header -->
                      <tr>
                        <td style="background-color:#1A4331;padding:32px 40px;text-align:center;">
                          <img src="https://img.icons8.com/ios-filled/100/ffffff/shield.png" alt="CityWatch Logo" width="48" height="48" style="display:block;margin:0 auto 12px auto;" />
                          <p style="margin:0;font-size:12px;letter-spacing:2px;color:#a8d5b5;text-transform:uppercase;font-weight:600;">Civic Issue Reporting Platform</p>
                          <h1 style="margin:8px 0 0 0;font-size:28px;font-weight:800;color:#ffffff;font-family:'Playfair Display', Georgia, serif;">CityWatch</h1>
                        </td>
                      </tr>
                      
                      <!-- Body -->
                      <tr>
                        <td style="padding:40px;">
                          <p style="margin:0 0 20px 0;font-size:16px;color:#4a5568;line-height:1.5;">
                            Hello <strong style="color:#1A4331;">%s</strong>,
                          </p>
                          <h2 style="margin:0 0 24px 0;font-size:20px;color:#1A4331;font-weight:700;line-height:1.3;font-family:'Playfair Display', Georgia, serif;">%s</h2>
                          
                          <!-- Notification Box -->
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:0 0 32px 0;">
                                <div style="background-color:#f0f7f2;border-left:4px solid #2E7D32;border-radius:0 8px 8px 0;padding:24px;">
                                  <p style="margin:0;font-size:16px;color:#2d3748;line-height:1.6;white-space:pre-wrap;">%s</p>
                                </div>
                              </td>
                            </tr>
                          </table>
                          
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <a href="http://localhost:5173" style="display:inline-block;background-color:#2E7D32;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;letter-spacing:0.5px;box-shadow: 0 2px 4px rgba(46, 125, 50, 0.3);">
                                  Open CityWatch Platform
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Divider -->
                          <hr style="border:none;border-top:1px solid #edf2f7;margin:32px 0 24px 0;" />
                          
                          <p style="margin:0;font-size:13px;color:#718096;text-align:center;line-height:1.5;">
                            You are receiving this because you have email notifications enabled on your CityWatch account.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #edf2f7;">
                          <p style="margin:0 0 8px 0;font-size:12px;color:#a0aec0;">
                            © 2026 CityWatch — Empowering civic communities
                          </p>
                          <p style="margin:0;font-size:10px;color:#cbd5e0;">
                            Ref: %s • Sent: %s
                          </p>
                        </td>
                      </tr>
                      
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(name, title, body, uniqueRef, currentDateTime);
    }
}
