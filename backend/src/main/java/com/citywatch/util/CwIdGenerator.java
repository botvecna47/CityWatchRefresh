package com.citywatch.util;

import com.citywatch.enums.Role;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * CityWatch Custom ID Generator
 *
 * ── User IDs (12 chars) ─────────────────────────────────────────────────────
 *   Format : {STATE}{RTO}{TYPE}{7-digit-seq}
 *   Example: GJ05C0000001  (Gujarat, RTO-05, Citizen, seq #1)
 *            GJ05M0000001  (Gujarat, RTO-05, Moderator/Coordinator, seq #1)
 *            GJ05A0000001  (Gujarat, RTO-05, Admin, seq #1)
 *
 * ── Event IDs (17 chars) ────────────────────────────────────────────────────
 *   Format : {PREFIX}-{DDMMYY}-{6-digit-seq}
 *   Example: CMP-090426-000001  (Complaint created on 09 Apr 2026)
 *            VOT-090426-000001  (Vote cast on 09 Apr 2026)
 *            CMT-090426-000001  (Comment on 09 Apr 2026)
 *            PRF-090426-000001  (Proof on 09 Apr 2026)
 *            ESC-090426-000001  (Escalation on 09 Apr 2026)
 *            NTF-090426-000001  (Notification on 09 Apr 2026)
 *            AUD-090426-000001  (Audit log on 09 Apr 2026)
 */
@Component
public class CwIdGenerator {

    @PersistenceContext
    private EntityManager em;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("ddMMyy");

    // ── User ID ──────────────────────────────────────────────────────────────

    /**
     * Generate a 12-char user ID based on role, state, and RTO zone.
     *
     * @param role      CITIZEN (C), COORDINATOR (M), ADMIN (A)
     * @param stateCode 2-letter Indian state code (e.g. GJ, MH, DL)
     * @param rtoCode   2-digit RTO district code (e.g. 05, 12)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String nextUserId(Role role, String stateCode, String rtoCode) {
        String seqName = switch (role) {
            case CITIZEN     -> "cw_user_c_seq";
            case COORDINATOR -> "cw_user_m_seq";
            case SUPERVISOR  -> "cw_user_s_seq";
            case ADMIN       -> "cw_user_a_seq";
        };

        String typeChar = switch (role) {
            case CITIZEN     -> "C";
            case COORDINATOR -> "M";
            case SUPERVISOR  -> "S";
            case ADMIN       -> "A";
        };

        Long seq = nextVal(seqName);
        // STATE(2) + RTO(2) + TYPE(1) + SEQ(7) = 12 chars
        return String.format("%2s%2s%s%07d",
                stateCode.toUpperCase(),
                rtoCode,
                typeChar,
                seq).replace(" ", "0");
    }

    // ── Complaint ID ─────────────────────────────────────────────────────────

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String nextComplaintId() {
        return buildEventId("CMP", "cw_complaint_seq");
    }

    // ── Vote ID ──────────────────────────────────────────────────────────────

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String nextVoteId() {
        return buildEventId("VOT", "cw_vote_seq");
    }

    // ── Comment ID ───────────────────────────────────────────────────────────

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String nextCommentId() {
        return buildEventId("CMT", "cw_comment_seq");
    }

    // ── Proof ID ─────────────────────────────────────────────────────────────

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String nextProofId() {
        return buildEventId("PRF", "cw_proof_seq");
    }

    // ── Escalation ID ────────────────────────────────────────────────────────

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String nextEscalationId() {
        return buildEventId("ESC", "cw_escalation_seq");
    }

    // ── Notification ID ──────────────────────────────────────────────────────

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String nextNotificationId() {
        return buildEventId("NTF", "cw_notification_seq");
    }

    // ── Audit Log ID ─────────────────────────────────────────────────────────

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String nextAuditId() {
        return buildEventId("AUD", "cw_audit_seq");
    }

    // ── Application ID ───────────────────────────────────────────────────────

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String nextApplicationId() {
        return buildEventId("APP", "cw_application_seq");
    }

    // ── Spam ID ──────────────────────────────────────────────────────────────

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String nextSpamId() {
        return buildEventId("SPM", "cw_spam_seq");
    }

    // ── Internal helpers ─────────────────────────────────────────────────────

    private String buildEventId(String prefix, String seqName) {
        String date = LocalDate.now().format(DATE_FMT);
        Long seq = nextVal(seqName);
        // PREFIX(3) + dash(1) + DATE(6) + dash(1) + SEQ(6) = 17 chars
        return String.format("%s-%s-%06d", prefix, date, seq);
    }

    @SuppressWarnings("unchecked")
    private Long nextVal(String sequenceName) {
        return ((Number) em
                .createNativeQuery("SELECT nextval('" + sequenceName + "')")
                .getSingleResult())
                .longValue();
    }
}
