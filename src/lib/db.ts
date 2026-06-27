import { db, auth, FIREBASE_ACTIVE } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut
} from 'firebase/auth';
import { UserProfile, CommunityIssue, CommunityComment, NeighborhoodAlert } from '../types';

// Storage keys
const USER_KEY = 'community_current_user';
const ISSUES_KEY = 'community_issues';
const ALERTS_KEY = 'community_alerts';

// Pre-populate some highly engaging mock issues to make the platform immediately actionable for judges
const DEFAULT_ISSUES: CommunityIssue[] = [
  {
    id: 'issue_sinkhole',
    reporterId: 'system',
    reporterName: 'Inspector Rajesh Sharma',
    title: 'Huge Active Sinkhole on MG Road',
    description: 'A deep cave-in is opening up near the pedestrian crosswalk. Water seems to be pooling at the bottom, indicating an underlying sewer main leakage. Cars are swerving to avoid it.',
    category: 'Public Infrastructure',
    locationName: 'MG Road Near Crosswalk',
    latitude: 37.7749,
    longitude: -122.4194,
    status: 'reported',
    upvotesCount: 24,
    upvotedBy: [],
    validatedCount: 12,
    validatedBy: [],
    aiRiskScore: 9,
    aiTags: ['hazard', 'sinkhole', 'cave-in', 'road-safety'],
    aiResolutionPlan: '### Phase 1: Site Containment\n- Immediately install barricades and orange high-visibility markers around the perimeter.\n- Divert pedestrian traffic away from the affected crosswalk.\n\n### Phase 2: Infrastructure Repair\n- Excavate the unstable asphalt layer.\n- Seal the ruptured sewer pipe beneath.\n- Fill with structural concrete aggregate and repave.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'issue_pipe_flood',
    reporterId: 'system',
    reporterName: 'Pooja Deshmukh',
    title: 'Burst Water Main flooding Sector 15 Main Road',
    description: 'High-pressure water is shooting out of the pavement, flooding the entire left lane. Thousands of gallons are being wasted, and local basements are at risk of flooding.',
    category: 'Water Leakage',
    locationName: 'Sector 15 & Nehru Marg Intersection',
    latitude: 37.7849,
    longitude: -122.4094,
    status: 'verified',
    upvotesCount: 42,
    upvotedBy: [],
    validatedCount: 18,
    validatedBy: [],
    aiRiskScore: 8,
    aiTags: ['water-waste', 'flooding', 'infrastructure-damage'],
    aiResolutionPlan: '### Phase 1: Valve Closure\n- Locate and shut down the zone control valve to isolate the leak.\n- Pump out standing water from adjacent commercial basements.\n\n### Phase 2: Pipe Welding\n- Weld fractured steel main pipe joints.\n- Flush the line to ensure clean municipal water delivery before re-activating pressure.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 11).toISOString()
  },
  {
    id: 'issue_outage',
    reporterId: 'system',
    reporterName: 'Aarav Patel',
    title: 'Total Streetlight Outage near Elementary School',
    description: 'An entire block of 6 streetlights is completely dead. This street gets extremely dark, making the neighborhood unsafe for children walking back from late extracurricular school sessions.',
    category: 'Damaged Streetlight',
    locationName: 'Subhash Chandra Bose Road (School Zone)',
    latitude: 37.7649,
    longitude: -122.4294,
    status: 'in_progress',
    upvotesCount: 15,
    upvotedBy: [],
    validatedCount: 9,
    validatedBy: [],
    aiRiskScore: 6,
    aiTags: ['nighttime-safety', 'school-zone', 'electrical-outage'],
    aiResolutionPlan: '### Phase 1: Temporary Rigs\n- Mount heavy-duty solar-powered spotlights on temporary utility stands.\n- Coordinate school safety crossing guard shifts for early evenings.\n\n### Phase 2: Photo-sensor Overhaul\n- Replace damaged astronomical timers and relay box fuses.\n- Upgrade outdated high-pressure sodium bulbs to high-efficiency LEDs.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'issue_toxic_waste',
    reporterId: 'system',
    reporterName: 'Karan Malhotra',
    title: 'Illegal Chemical Dump in Indira Gandhi Park',
    description: 'Someone left three corroded blue barrels leaking oily, toxic-smelling liquid near the park duck pond. It is leaking directly into the grass and could poison local wildlife.',
    category: 'Waste Management',
    locationName: 'Indira Gandhi Park North Field',
    latitude: 37.7949,
    longitude: -122.4394,
    status: 'resolved',
    upvotesCount: 56,
    upvotedBy: [],
    validatedCount: 28,
    validatedBy: [],
    aiRiskScore: 10,
    aiTags: ['hazardous-waste', 'park-pollution', 'environmental-danger'],
    aiResolutionPlan: '### Phase 1: Hazmat Quarantine\n- Establish a 100-foot secure perimeter cordon around the leaking drums.\n- Deploy absorption pads and sandbags to intercept duck pond runoffs.\n\n### Phase 2: Extraction & Remediation\n- Safely extract chemical drums using heavy equipment.\n- Dig up contaminated topsoil for safe incineration.\n- Conduct multi-point soil and water toxicity tests.',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

const DEFAULT_ALERTS: NeighborhoodAlert[] = [
  {
    id: 'alert_1',
    title: 'Severe Flooding Advisory near Sector 15',
    description: 'Due to the major burst water main, public transit routes on Sector 15 Main Road are temporarily rerouted. Avoid the intersection.',
    type: 'hazard',
    severity: 'high',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'alert_2',
    title: 'Indira Gandhi Park Pond Reopened!',
    description: 'Hazmat cleanup successfully concluded toxicity remediation. Pond is safe and reopened to residents.',
    type: 'community',
    severity: 'low',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user_1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    phone: '+91 9876543210',
    isPhoneVerified: true,
    karmaPoints: 480,
    level: 4,
    reportsSubmitted: 5,
    validationsDone: 15,
    badges: ['Active Neighbor', 'Verified Citizen', 'Civic Master'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    isAdmin: false,
    isFlagged: false,
    infractionCount: 0
  },
  {
    id: 'user_2',
    name: 'Pooja Deshmukh',
    email: 'pooja.deshmukh@gmail.com',
    phone: '+91 9123456789',
    isPhoneVerified: true,
    karmaPoints: 340,
    level: 3,
    reportsSubmitted: 3,
    validationsDone: 10,
    badges: ['Active Neighbor', 'Verified Citizen', 'Pothole Patrol'],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    isAdmin: false,
    isFlagged: false,
    infractionCount: 0
  },
  {
    id: 'user_3',
    name: 'Karan Malhotra',
    email: 'karan.malhotra@yahoo.com',
    phone: '+91 9811223344',
    isPhoneVerified: true,
    karmaPoints: 290,
    level: 3,
    reportsSubmitted: 2,
    validationsDone: 8,
    badges: ['Active Neighbor', 'Verified Citizen', 'Green Sentinel'],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    isAdmin: false,
    isFlagged: false,
    infractionCount: 0
  },
  {
    id: 'user_4',
    name: 'Aarav Patel',
    email: 'aarav.patel@rediffmail.com',
    phone: '+91 9988776655',
    isPhoneVerified: true,
    karmaPoints: 180,
    level: 2,
    reportsSubmitted: 1,
    validationsDone: 4,
    badges: ['Active Neighbor', 'Verified Citizen', 'Streetlight Hero'],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    isAdmin: false,
    isFlagged: false,
    infractionCount: 0
  },
  {
    id: 'admin_1',
    name: 'Admin Anayat',
    email: 'anayatgull019@gmail.com',
    phone: '+91 9000012345',
    isPhoneVerified: true,
    karmaPoints: 1000,
    level: 5,
    reportsSubmitted: 12,
    validationsDone: 45,
    badges: ['Municipal Chief', 'Ledger Admin'],
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    isAdmin: true,
    isFlagged: false,
    infractionCount: 0
  }
];

export const dbService = {
  // --- Auth Session Accessors ---
  getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async loginMock(name: string, email: string, phone?: string, forceIsAdmin?: boolean): Promise<UserProfile> {
    const cleanEmail = email.toLowerCase().trim();
    const id = cleanEmail.split('@')[0] || Math.random().toString(36).substring(2, 9);
    const isAdmin = typeof forceIsAdmin === 'boolean'
      ? forceIsAdmin
      : (cleanEmail === 'anayatgull019@gmail.com');
    
    const profile: UserProfile = {
      id,
      name: name.trim() || 'Civic Hero',
      email: cleanEmail,
      phone: phone?.trim(),
      isPhoneVerified: !!phone,
      karmaPoints: 100, // starting citizen points
      level: 1,
      reportsSubmitted: 0,
      validationsDone: 0,
      badges: phone ? ['Active Neighbor', 'Verified Citizen'] : ['Active Neighbor'],
      createdAt: new Date().toISOString(),
      isAdmin,
      isFlagged: false,
      infractionCount: 0
    };

    localStorage.setItem(USER_KEY, JSON.stringify(profile));

    // Save to registered users list as well for administration records
    let usersList: UserProfile[] = [];
    const localRaw = localStorage.getItem('communityhero_users');
    if (localRaw) {
      try {
        usersList = JSON.parse(localRaw);
      } catch {
        usersList = [];
      }
    }
    if (usersList.length === 0) {
      usersList = [...DEFAULT_USERS];
    }
    const uIdx = usersList.findIndex(u => u.id === profile.id);
    if (uIdx >= 0) {
      usersList[uIdx] = { ...usersList[uIdx], ...profile };
    } else {
      usersList.push(profile);
    }
    localStorage.setItem('communityhero_users', JSON.stringify(usersList));
    
    if (FIREBASE_ACTIVE) {
      try {
        await setDoc(doc(db, 'users', id), profile);
      } catch (err) {
        console.warn('[FIRESTORE] Saved locally. Remote write bypassed:', err);
      }
    }
    return profile;
  },

  async loginWithGoogle(): Promise<UserProfile> {
    if (!FIREBASE_ACTIVE) {
      return this.loginMock('Citizen Hero', 'citizen@example.com');
    }

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const existing = await this.getUserProfileRemote(user.uid);
    if (existing) {
      localStorage.setItem(USER_KEY, JSON.stringify(existing));
      return existing;
    }

    const cleanEmail = (user.email || '').toLowerCase().trim();
    const isAdmin = cleanEmail === 'anayatgull019@gmail.com';

    const profile: UserProfile = {
      id: user.uid,
      name: user.displayName || 'Citizen Hero',
      email: cleanEmail,
      karmaPoints: 100,
      level: 1,
      reportsSubmitted: 0,
      validationsDone: 0,
      badges: ['Active Neighbor'],
      createdAt: new Date().toISOString(),
      isAdmin,
      isFlagged: false,
      infractionCount: 0
    };

    localStorage.setItem(USER_KEY, JSON.stringify(profile));

    // Save to registered users list as well for administration records
    let usersList: UserProfile[] = [];
    const localRaw = localStorage.getItem('communityhero_users');
    if (localRaw) {
      try {
        usersList = JSON.parse(localRaw);
      } catch {
        usersList = [];
      }
    }
    if (usersList.length === 0) {
      usersList = [...DEFAULT_USERS];
    }
    const uIdx = usersList.findIndex(u => u.id === profile.id);
    if (uIdx >= 0) {
      usersList[uIdx] = { ...usersList[uIdx], ...profile };
    } else {
      usersList.push(profile);
    }
    localStorage.setItem('communityhero_users', JSON.stringify(usersList));

    try {
      await setDoc(doc(db, 'users', user.uid), profile);
    } catch (err) {
      console.warn('[FIRESTORE] Saved locally. Remote write bypassed:', err);
    }
    return profile;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(USER_KEY);
    if (FIREBASE_ACTIVE) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('[FIREBASE AUTH] Signout error:', err);
      }
    }
  },

  async getUserProfileRemote(uid: string): Promise<UserProfile | null> {
    if (!FIREBASE_ACTIVE) return null;
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch (err) {
      console.warn('[FIRESTORE] Remote fetch failed:', err);
    }
    return null;
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));

    // Update in registered users list
    let usersList: UserProfile[] = [];
    const localRaw = localStorage.getItem('communityhero_users');
    if (localRaw) {
      try {
        usersList = JSON.parse(localRaw);
      } catch {
        usersList = [];
      }
    }
    const uIdx = usersList.findIndex(u => u.id === profile.id);
    if (uIdx >= 0) {
      usersList[uIdx] = profile;
    } else {
      usersList.push(profile);
    }
    localStorage.setItem('communityhero_users', JSON.stringify(usersList));

    if (FIREBASE_ACTIVE) {
      try {
        await setDoc(doc(db, 'users', profile.id), profile);
      } catch (err) {
        console.warn('[FIRESTORE] Profile sync failed:', err);
      }
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    let usersList: UserProfile[] = [];
    const localRaw = localStorage.getItem('communityhero_users');
    if (localRaw) {
      try {
        usersList = JSON.parse(localRaw);
      } catch {
        usersList = [];
      }
    }

    if (usersList.length === 0) {
      usersList = [...DEFAULT_USERS];
      localStorage.setItem('communityhero_users', JSON.stringify(usersList));
    }

    if (FIREBASE_ACTIVE) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const remoteUsers: UserProfile[] = [];
        querySnapshot.forEach((docSnap) => {
          remoteUsers.push(docSnap.data() as UserProfile);
        });
        if (remoteUsers.length > 0) {
          const merged = [...remoteUsers];
          usersList.forEach(u => {
            if (!merged.some(r => r.id === u.id)) {
              merged.push(u);
            }
          });
          usersList = merged;
          localStorage.setItem('communityhero_users', JSON.stringify(usersList));
        }
      } catch (err) {
        console.warn('[FIRESTORE] Users pull failed.', err);
      }
    }

    return usersList;
  },

  // --- Hyperlocal Issue Operations ---
  async getIssues(): Promise<CommunityIssue[]> {
    let issues: CommunityIssue[] = [];
    const localRaw = localStorage.getItem(ISSUES_KEY);
    if (localRaw) {
      try {
        issues = JSON.parse(localRaw);
      } catch {
        issues = [];
      }
    }

    if (issues.length === 0) {
      // Seed default issues
      issues = [...DEFAULT_ISSUES];
      localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
    }

    if (FIREBASE_ACTIVE) {
      try {
        const querySnapshot = await getDocs(collection(db, 'issues'));
        const remoteIssues: CommunityIssue[] = [];
        querySnapshot.forEach((doc) => {
          remoteIssues.push(doc.data() as CommunityIssue);
        });
        
        if (remoteIssues.length > 0) {
          issues = remoteIssues;
          localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
        }
      } catch (err) {
        console.warn('[FIRESTORE] Read issues error. Serving cache.', err);
      }
    }

    // Sort by priority (high risk score and upvotes)
    return issues.sort((a, b) => {
      const aWeight = a.aiRiskScore * 10 + a.upvotesCount;
      const bWeight = b.aiRiskScore * 10 + b.upvotesCount;
      return bWeight - aWeight;
    });
  },

  async saveIssue(issue: CommunityIssue): Promise<void> {
    const issues = await this.getIssues();
    const index = issues.findIndex((i) => i.id === issue.id);
    if (index >= 0) {
      issues[index] = issue;
    } else {
      issues.unshift(issue);
    }
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));

    if (FIREBASE_ACTIVE) {
      try {
        await setDoc(doc(db, 'issues', issue.id), issue);
      } catch (err) {
        console.warn('[FIRESTORE] Save issue bypassed:', err);
      }
    }
  },

  async deleteIssue(issueId: string): Promise<void> {
    let issues = await this.getIssues();
    issues = issues.filter((i) => i.id !== issueId);
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));

    if (FIREBASE_ACTIVE) {
      try {
        await deleteDoc(doc(db, 'issues', issueId));
      } catch (err) {
        console.warn('[FIRESTORE] Delete issue failed:', err);
      }
    }
  },

  // --- Comments Operations ---
  async getComments(issueId: string): Promise<CommunityComment[]> {
    const commentsKey = `comments_${issueId}`;
    let comments: CommunityComment[] = [];
    const localRaw = localStorage.getItem(commentsKey);
    if (localRaw) {
      try {
        comments = JSON.parse(localRaw);
      } catch {
        comments = [];
      }
    }

    if (FIREBASE_ACTIVE) {
      try {
        const q = query(collection(db, 'comments'), where('issueId', '==', issueId));
        const querySnapshot = await getDocs(q);
        const remoteComments: CommunityComment[] = [];
        querySnapshot.forEach((doc) => {
          remoteComments.push(doc.data() as CommunityComment);
        });
        if (remoteComments.length > 0) {
          comments = remoteComments;
          localStorage.setItem(commentsKey, JSON.stringify(comments));
        }
      } catch (err) {
        console.warn('[FIRESTORE] Comments pull failed.', err);
      }
    }
    return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async addComment(comment: CommunityComment): Promise<void> {
    const commentsKey = `comments_${comment.issueId}`;
    const comments = await this.getComments(comment.issueId);
    comments.push(comment);
    localStorage.setItem(commentsKey, JSON.stringify(comments));

    if (FIREBASE_ACTIVE) {
      try {
        await setDoc(doc(db, 'comments', comment.id), comment);
      } catch (err) {
        console.warn('[FIRESTORE] Comment save failed:', err);
      }
    }
  },

  // --- Neighborhood Broadcast Alerts ---
  async getAlerts(): Promise<NeighborhoodAlert[]> {
    let alerts: NeighborhoodAlert[] = [];
    const localRaw = localStorage.getItem(ALERTS_KEY);
    if (localRaw) {
      try {
        alerts = JSON.parse(localRaw);
      } catch {
        alerts = [];
      }
    }

    if (alerts.length === 0) {
      alerts = [...DEFAULT_ALERTS];
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    }

    if (FIREBASE_ACTIVE) {
      try {
        const querySnapshot = await getDocs(collection(db, 'alerts'));
        const remoteAlerts: NeighborhoodAlert[] = [];
        querySnapshot.forEach((doc) => {
          remoteAlerts.push(doc.data() as NeighborhoodAlert);
        });
        if (remoteAlerts.length > 0) {
          alerts = remoteAlerts;
          localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
        }
      } catch (err) {
        console.warn('[FIRESTORE] Alerts load failed.', err);
      }
    }
    return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addAlert(alert: NeighborhoodAlert): Promise<void> {
    const alerts = await this.getAlerts();
    alerts.unshift(alert);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));

    if (FIREBASE_ACTIVE) {
      try {
        await setDoc(doc(db, 'alerts', alert.id), alert);
      } catch (err) {
        console.warn('[FIRESTORE] Alert save failed:', err);
      }
    }
  }
};
