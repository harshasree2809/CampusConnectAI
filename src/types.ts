export type UserRole = 'admin' | 'faculty' | 'student';

export type OpportunityCategory = 
  | 'internship'
  | 'job'
  | 'certificate'
  | 'hackathon'
  | 'knowledge';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  graduationYear?: number; // e.g. 2026
  rollNumber?: string;
  phone?: string;
  isVerified: boolean;
  verificationMethod?: 'college_email' | 'id_card_kyc' | 'faculty_creds';
  verificationStatus?: 'approved' | 'pending' | 'rejected';
  kycDetails?: {
    idCardUrl?: string;
    photoUrl?: string;
    videoVerified?: boolean;
    passingYear?: number;
    matchScore?: number;
    submittedAt?: string;
  };
}

export interface CommentItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  category: OpportunityCategory;
  description: string;
  eligibilityBatches: number[]; // e.g. [2025, 2026]
  eligibleBranches: string[];   // e.g. ['CSE', 'IT', 'ECE']
  stipendOrSalary: string;      // e.g. "₹45,000 / mo" or "100% Free" or "12 - 18 LPA"
  location: string;             // e.g. "Remote", "Bengaluru", "On-Campus"
  compensationAmount?: number | null;
  compensationCurrency?: string;
  compensationPeriod?: string;
  applyUrl: string;
  deadline: string;             // ISO Date string: e.g. "2026-09-11T18:00:00.000Z"
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorDept?: string;
  authorBatch?: number;
  postedAt: string;
  likes: string[];              // list of user IDs who liked
  isPinned?: boolean;
  isVerifiedByAdmin?: boolean;
  preparationTips?: string;
  comments?: CommentItem[];
}

export interface KYCSubmission {
  userId?: string;
  id: string;
  studentName: string;
  rollNumber: string;
  department: string;
  passingYear: number;
  mobile: string;
  idCardUrl: string;
  passportPhotoUrl: string;
  videoCaptured: boolean;
  matchScore: number | null;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'urgent_deadline' | 'admin_verified' | 'kyc_status' | 'like';
  timestamp: string;
  opportunityId?: string;
  isRead: boolean;
}

export type ApplicationStatus = 
  | 'applied' 
  | 'shortlisted' 
  | 'assessment' 
  | 'interview' 
  | 'offered' 
  | 'rejected';

export interface StudentApplication {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  company: string;
  category: OpportunityCategory;
  appliedDate: string;
  status: ApplicationStatus;
  applicationNumber?: string;
  nextStepDate?: string;
  notes?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRoll: string;
  studentBranch?: string;
  studentBatch?: number;
}

export interface DriveEvent {
  endDate?: string;
  id: string;
  opportunityId?: string;
  company: string;
  title: string;
  eventType: 'ppt' | 'assessment' | 'interview' | 'hackathon' | 'deadline';
  date: string; // ISO string
  location: string;
  eligibleBatches: number[];
  notes: string;
}

export interface ResumeMatchResult {
  score: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  interviewTips: string[];
}
