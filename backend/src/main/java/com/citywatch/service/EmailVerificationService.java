package com.citywatch.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * EmailVerificationService — Handles OTP-based email verification for new user registrations.
 *
 * ► OTPs are stored in-memory (ConcurrentHashMap) with a configurable TTL.
 * ► Every OTP is ALWAYS printed to the console/CMD so you can test without SMTP credentials.
 * ► If SMTP credentials are configured AND JavaMailSender is available, a branded HTML email
 *   is also sent to the user. The service degrades gracefully if mail is not configured.
 */
@Service
public class EmailVerificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailVerificationService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // In-memory store: email -> OtpEntry (pending verification)
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    // Emails that have passed OTP verification but not yet registered
    private final java.util.Set<String> verifiedEmails = java.util.Collections.newSetFromMap(new ConcurrentHashMap<>());

    // Optional: null when spring-boot-starter-mail is not configured or SMTP is unavailable
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    // ─── Public API ────────────────────────────────────────────────────────────

    /**
     * Generates a 6-digit OTP, stores it with TTL, prints it to console,
     * and attempts to send it via Gmail SMTP (if credentials are configured).
     */
    public void sendOtp(String email) {
        String otp = generateOtp();
        otpStore.put(email.toLowerCase(), new OtpEntry(otp, LocalDateTime.now().plusMinutes(otpExpiryMinutes)));

        // ✅ ALWAYS log to console/CMD — works without any SMTP config
        log.info("╔══════════════════════════════════════════════════╗");
        log.info("║         CITYWATCH — EMAIL VERIFICATION OTP        ║");
        log.info("╠══════════════════════════════════════════════════╣");
        log.info("║  Email  : {}",    email);
        log.info("║  OTP    : {}                                      ║", otp);
        log.info("║  Expires: {} minutes                              ║", otpExpiryMinutes);
        log.info("╚══════════════════════════════════════════════════╝");

        // Attempt SMTP send (skip gracefully if mailSender is null or credentials are not configured)
        if (mailSender != null && smtpUsername != null && !smtpUsername.isBlank()) {
            try {
                sendHtmlEmail(email, otp);
                log.info("[EmailVerification] OTP email sent to {}", email);
            } catch (Exception e) {
                log.warn("[EmailVerification] Failed to send email to {} — check SMTP credentials. OTP is still valid (see console above). Error: {}", email, e.getMessage());
            }
        } else {
            log.warn("[EmailVerification] SMTP_USERNAME not configured — email not sent. Use the OTP printed above.");
        }
    }

    /**
     * Verifies the provided OTP against the stored entry for the given email.
     * Removes the entry on success (single-use).
     */
    public boolean verifyOtp(String email, String otp) {
        OtpEntry entry = otpStore.get(email.toLowerCase());
        if (entry == null) {
            log.warn("[EmailVerification] No OTP found for email: {}", email);
            return false;
        }
        if (LocalDateTime.now().isAfter(entry.expiresAt())) {
            otpStore.remove(email.toLowerCase());
            log.warn("[EmailVerification] OTP expired for email: {}", email);
            return false;
        }
        if (!entry.otp().equals(otp)) {
            log.warn("[EmailVerification] Incorrect OTP for email: {}", email);
            return false;
        }
        // Valid — mark as verified: remove from pending and add to verified set
        otpStore.remove(email.toLowerCase());
        verifiedEmails.add(email.toLowerCase());
        log.info("[EmailVerification] OTP verified successfully for email: {}", email);
        return true;
    }

    /**
     * Returns true if the email has passed OTP verification and hasn't registered yet.
     */
    public boolean isVerified(String email) {
        return verifiedEmails.contains(email.toLowerCase());
    }

    /**
     * Consumes (removes) the verified status for an email — called after successful registration.
     */
    public void consumeVerification(String email) {
        verifiedEmails.remove(email.toLowerCase());
    }

    // ─── Private Helpers ───────────────────────────────────────────────────────

    private String generateOtp() {
        int code = 100_000 + SECURE_RANDOM.nextInt(900_000);
        return String.valueOf(code);
    }

    private void sendHtmlEmail(String toEmail, String otp) throws MessagingException, java.io.UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(smtpUsername, "CityWatch");
        helper.setTo(toEmail);
        helper.setSubject("Your CityWatch Verification Code");
        helper.setText(buildHtmlEmail(otp), true);

        mailSender.send(message);
    }

    /**
     * Builds a branded HTML email that matches CityWatch's dark-green theme.
     */
    private String buildHtmlEmail(String otp) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>CityWatch Verification</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f5f5f0;font-family:'Georgia',serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e0d8;max-width:560px;width:100%%;">
                      
                      <!-- Header -->
                      <tr>
                        <td style="background-color:#1A4331;padding:32px 40px;text-align:center;">
                          <p style="margin:0;font-size:13px;letter-spacing:3px;color:#a8d5b5;text-transform:uppercase;font-family:Arial,sans-serif;">Civic Issue Reporting Platform</p>
                          <h1 style="margin:8px 0 0 0;font-size:28px;font-weight:700;color:#ffffff;font-family:'Georgia',serif;">CityWatch</h1>
                        </td>
                      </tr>
                      
                      <!-- Body -->
                      <tr>
                        <td style="padding:40px;">
                          <h2 style="margin:0 0 16px 0;font-size:22px;color:#1A4331;font-family:'Georgia',serif;">Verify Your Email Address</h2>
                          <p style="margin:0 0 24px 0;font-size:15px;color:#555;line-height:1.6;font-family:Arial,sans-serif;">
                            Thank you for joining CityWatch. To complete your registration and start reporting civic issues in your community, please use the verification code below.
                          </p>
                          
                          <!-- OTP Box -->
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" style="padding:8px 0 32px 0;">
                                <div style="display:inline-block;background-color:#f0f7f2;border:2px solid #2E7D32;border-radius:8px;padding:24px 48px;">
                                  <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:2px;color:#2E7D32;text-transform:uppercase;font-family:Arial,sans-serif;">Your Verification Code</p>
                                  <p style="margin:0;font-size:40px;font-weight:700;color:#1A4331;letter-spacing:12px;font-family:'Courier New',monospace;">%s</p>
                                </div>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="margin:0 0 8px 0;font-size:14px;color:#777;font-family:Arial,sans-serif;">
                            ⏱ This code expires in <strong style="color:#1A4331;">10 minutes</strong>.
                          </p>
                          <p style="margin:0 0 32px 0;font-size:14px;color:#777;font-family:Arial,sans-serif;">
                            If you did not create a CityWatch account, you can safely ignore this email.
                          </p>
                          
                          <!-- Divider -->
                          <hr style="border:none;border-top:1px solid #e8e8e0;margin:0 0 24px 0;" />
                          
                          <p style="margin:0;font-size:13px;color:#aaa;font-family:Arial,sans-serif;">
                            For security, never share this code with anyone. CityWatch staff will never ask for your verification code.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color:#1A4331;padding:20px 40px;text-align:center;">
                          <p style="margin:0;font-size:12px;color:#a8d5b5;font-family:Arial,sans-serif;">
                            © 2026 CityWatch — Empowering civic communities
                          </p>
                        </td>
                      </tr>
                      
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(otp);
    }

    // ─── Inner Record ──────────────────────────────────────────────────────────

    private record OtpEntry(String otp, LocalDateTime expiresAt) {}
}
