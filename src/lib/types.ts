import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'student' | 'graduate' | 'experienced' | 'recruiter' | 'admin';

export interface User {
  uid: string;
  role: UserRole;
  email: string;
  fullName: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verificationLevel: 'unverified' | 'partial' | 'verified';
  status: 'active' | 'suspended' | 'banned';
}

export interface JobSeekerProfile {
  userId: string;
  type: 'student' | 'graduate' | 'experienced';
  fullName: string;
  headline: string;
  skills: string[];
  domain: string;
  preferredRoles: string[];
  experienceYears: number;
  preferredLocations: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  graduationYear?: number;
  collegeName?: string;
  verification: {
    level: 'unverified' | 'partial' | 'verified';
    typeBadges: string[];
    identityVerified: boolean;
    educationVerified: boolean;
    experienceVerified: boolean;
    lastReviewedAt?: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RecruiterProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  roleInCompany: string;
  companyId?: string;
  workEmailVerified: boolean;
  linkedinUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  domain: string;
  registrationNo?: string;
  docs?: {
    type: 'registrationCert' | 'gst' | 'other';
    storagePath: string;
  }[];
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  createdBy: string; // recruiter userId
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string; // denormalized for easy display
  companyLogoUrl?: string; // denormalized
  postedBy: string; // recruiter userId
  title: string;
  roleType: 'internship' | 'full-time' | 'part-time';
  experienceLevel: 'fresher' | '0-1' | '1-3' | '3+';
  domain: string;
  requiredSkills: string[];
  location: {
    city: string;
    remoteAllowed: boolean;
  };
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  description: string;
  openings: number;
  screeningQuestions: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface JobSwipe {
  userId: string;
  jobId: string;
  direction: 'left' | 'right';
  createdAt: Timestamp;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  jobTitle?: string; // Denormalized for mock data
  recruiterId: string;
  companyId: string;
  companyName?: string; // Denormalized for mock data
  answers: {
    question: string;
    answer: string;
  }[];
  resumeUrl: string;
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Conversation {
  id: string;
  participants: [string, string]; // [candidateId, recruiterId]
  jobId: string;
  createdAt: Timestamp;
  lastMessageAt: Timestamp;
  lastMessageText?: string;
  status: 'active' | 'closed';
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
  readBy: string[];
}

export interface VerificationRequest {
  id: string;
  userId: string;
  roleType: 'graduate' | 'experienced';
  documents: {
    type: 'marksheet' | 'degree' | 'idProof' | 'other' | 'offerLetter' | 'payslip';
    storagePath: string;
  }[];
  links?: {
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  createdAt: Timestamp;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'job' | 'user' | 'company';
  targetId: string;
  reason: 'fake job' | 'asking for money' | 'abusive' | 'misleading' | 'other';
  description: string;
  createdAt: Timestamp;
  status: 'open' | 'reviewed';
  reviewedBy?: string;
  reviewedAt?: Timestamp;
}
