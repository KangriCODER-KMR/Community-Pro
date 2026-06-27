export interface UserProfile {
  id: string; // auth UID or simulated ID
  name: string;
  email: string;
  karmaPoints: number;
  level: number;
  reportsSubmitted: number;
  validationsDone: number;
  badges: string[]; // e.g. "Pothole Patrol", "Streetlight Sentinel", "Civic Champion"
  createdAt: string;
  isAdmin?: boolean;
  isFlagged?: boolean;
  infractionCount?: number;
  mythsBustedCount?: number;
  governmentInterventionsApproved?: number;
  claimedRewards?: string[];
  phone?: string;
  isPhoneVerified?: boolean;
}

export type IssueStatus = 'reported' | 'verified' | 'in_progress' | 'resolved';

export interface CommunityIssue {
  id: string;
  reporterId: string;
  reporterName: string;
  title: string;
  description: string;
  category: 'Pothole' | 'Water Leakage' | 'Damaged Streetlight' | 'Waste Management' | 'Public Infrastructure' | 'Other';
  locationName: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  status: IssueStatus;
  upvotesCount: number;
  upvotedBy: string[]; // user IDs
  validatedCount: number;
  validatedBy: string[]; // user IDs
  aiRiskScore: number; // 1-10 priority score
  aiTags: string[];
  aiResolutionPlan: string;
  createdAt: string;
  updatedAt: string;
  isTelemetryTriggered?: boolean;
  sensorType?: 'acoustic' | 'thermal' | 'manual_pulse';
  tamperFlags?: number;
  cryptographicSignature?: string;
  
  // Government Portal Integration
  governmentAgency?: string; // e.g. "Department of Public Works"
  governmentStatus?: 'unlinked' | 'linked' | 'acknowledged' | 'dispatched' | 'resolved';
  governmentWorkOrderId?: string;
  governmentNotes?: string;
  governmentSyncedAt?: string;
  governmentInterventionRequired?: boolean;

  // Myth-Busting / Fake & Duplicate Issue Tracker
  isMythFlagged?: boolean;
  mythBustStatus?: 'verified_authentic' | 'myth_busted' | 'under_review';
  mythBustExplanation?: string;
  mythBusterId?: string;
  mythBusterName?: string;
  mediaType?: 'image' | 'video';
  reporterPhone?: string;
  reporterPhoneVerified?: boolean;
}

export interface CommunityComment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface NeighborhoodAlert {
  id: string;
  title: string;
  description: string;
  type: 'hazard' | 'maintenance' | 'community';
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
}
