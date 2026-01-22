// Status labels and colors
export const ISSUE_STATUS = {
  REPORTED: { label: 'Reported', color: 'var(--status-reported)' },
  UNDER_REVIEW: { label: 'Under Review', color: 'var(--status-under-review)' },
  VERIFIED: { label: 'Verified', color: 'var(--status-verified)' },
  ESCALATED: { label: 'Escalated', color: 'var(--status-escalated)' },
  ACTION_TAKEN: { label: 'Action Taken', color: 'var(--status-action-taken)' },
  CLOSED: { label: 'Closed', color: 'var(--status-closed)' },
  REJECTED: { label: 'Rejected', color: 'var(--status-rejected)' },
};

export const ISSUE_SEVERITY = {
  LOW: { label: 'Low', color: 'var(--severity-low)' },
  MEDIUM: { label: 'Medium', color: 'var(--severity-medium)' },
  HIGH: { label: 'High', color: 'var(--severity-high)' },
  CRITICAL: { label: 'Critical', color: 'var(--severity-critical)' },
};

export const USER_ROLES = {
  CITIZEN: 'Citizen',
  VERIFIED_CONTRIBUTOR: 'Verified Contributor',
  MODERATOR: 'Moderator',
  CITY_ADMIN: 'City Admin',
  AUTHORITY: 'Authority',
  SUPER_ADMIN: 'Super Admin',
};

// Expected outcomes for issue submission
export const EXPECTED_OUTCOMES = [
  { value: 'REPAIR', label: 'Repair needed' },
  { value: 'CLEANUP', label: 'Cleanup required' },
  { value: 'INSPECTION', label: 'Inspection needed' },
  { value: 'INFORMATION', label: 'Information requested' },
  { value: 'OTHER', label: 'Other' },
];

// Rejection reasons for moderation
export const REJECTION_REASONS = [
  { value: 'INSUFFICIENT_EVIDENCE', label: 'Insufficient evidence' },
  { value: 'OLD_MEDIA', label: 'Old or reused media' },
  { value: 'DUPLICATE', label: 'Duplicate issue' },
  { value: 'NOT_CIVIC', label: 'Not a civic issue' },
  { value: 'PERSONAL_ATTACK', label: 'Contains personal attacks' },
  { value: 'POLITICAL_CONTENT', label: 'Contains political content' },
  { value: 'UNVERIFIABLE_LOCATION', label: 'Unverifiable location' },
];

// Map settings
export const MAP_CONFIG = {
  defaultCenter: [20.5937, 78.9629], // India center
  defaultZoom: 5,
  cityZoom: 12,
  issueZoom: 16,
  tileUrl: import.meta.env.VITE_MAP_TILE_URL,
};

// File upload limits
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
};

// Pagination
export const PAGINATION = {
  defaultLimit: 20,
  limitOptions: [10, 20, 50],
};
