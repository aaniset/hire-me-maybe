import { ObjectId } from "mongodb";

export interface KanbanCard {
  id: string;
  company: string;
  position: string;
  date: string;
  status: string;
  priority: "low" | "medium" | "high";
}

export interface KanbanColumn {
  id: string;
  title: string;
}

export interface Email {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  body: string;
  to: string;
  date: Date;
}
export interface Keyword {
  word: string;
  weight: number;
  isNegative?: boolean;
}
export interface ClassifiedEmail extends Email {
  matchPercentage: number;
}

export interface HistoryRecord {
  userId: ObjectId;
  historyId: string;
}

export interface MergedObject {
  id: string;
  isJobRelated: boolean;
  jobData: {
    jobId: string;
    position: string;
    company: string;
    status: string;
    nextStep: string;
    applicationDate: string;
    keyDetails: string[];
  };
  body: string;
  date: string;
  from: string;
  fromName: string;
  matchPercentage: number;
  score: number;
  subject: string;
  to: string;
}

export interface EmailDocument {
  _id?: ObjectId;
  from: string;
  fromName: string;
  subject: string;
  body: string;
  to: string;
  date: Date;
  score: number;
  matchPercentage: number;
  messageId: string;
  isJobRelated: boolean;
  userId: string;
  applicationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationDocument {
  _id?: ObjectId | null;
  jobId: string;
  position: string;
  company: string;
  status: string;
  nextStep: string;
  applicationDate: string;
  keyDetails: string[];
  userId: string;
  date: Date;
  emailContentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
