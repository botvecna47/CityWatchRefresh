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
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>CityWatch Notification</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f5f5f0;font-family:'Georgia',serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0"
                      style="background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0d8;max-width:560px;width:100%%;">

                      <!-- Header -->
                      <tr>
                        <td style="background-color:#1A4331;padding:28px 32px;">
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td>
                                <span style="font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">
                                  🌿 CityWatch
                                </span>
                              </td>
                              <td align="right">
                                <span style="font-size:11px;color:#9ECBA8;font-family:sans-serif;letter-spacing:1px;text-transform:uppercase;">
                                  Notification
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:32px;">
                          <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280;font-family:sans-serif;">
                            Hello, %s
                          </p>
                          <h2 style="margin:0 0 20px 0;font-size:20px;color:#1A4331;line-height:1.3;">
                            %s
                          </h2>
                          <div style="background:#f9faf9;border-left:4px solid #2E7D32;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
                            <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;font-family:sans-serif;">
                              %s
                            </p>
                          </div>
                          <a href="https://citywatch.app/notifications"
                            style="display:inline-block;background-color:#2E7D32;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-family:sans-serif;font-weight:bold;">
                            View in CityWatch →
                          </a>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background-color:#f5f5f0;padding:20px 32px;border-top:1px solid #e5e7eb;">
                          <p style="margin:0;font-size:11px;color:#9ca3af;font-family:sans-serif;line-height:1.6;">
                            You are receiving this because you have email notifications enabled on your CityWatch account.<br/>
                            To unsubscribe, go to <strong>Settings → Notifications</strong> and turn off Email Notifications.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(name, title, body.replace("\n", "<br/>"));
    }
}
