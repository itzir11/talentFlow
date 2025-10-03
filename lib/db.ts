import Dexie, { type Table } from "dexie"

export interface Job {
  id: string
  title: string
  slug: string
  status: "active" | "archived"
  tags: string[]
  order: number
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected"
  jobId: string
  createdAt: string
  updatedAt: string
  phone?: string
  resume?: string
}

export interface CandidateTimeline {
  id: string
  candidateId: string
  fromStage: string | null
  toStage: string
  timestamp: string
  note?: string
}

export interface CandidateNote {
  id: string
  candidateId: string
  content: string
  mentions: string[]
  createdAt: string
  createdBy: string
}

export type QuestionType = "single-choice" | "multi-choice" | "short-text" | "long-text" | "numeric" | "file-upload"

export interface Question {
  id: string
  type: QuestionType
  label: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    maxLength?: number
  }
  conditionalOn?: {
    questionId: string
    value: string | string[]
  }
}

export interface AssessmentSection {
  id: string
  title: string
  questions: Question[]
}

export interface Assessment {
  id: string
  jobId: string
  title: string
  sections: AssessmentSection[]
  createdAt: string
  updatedAt: string
}

export interface AssessmentResponse {
  id: string
  assessmentId: string
  candidateId: string
  responses: Record<string, any>
  submittedAt: string
}

class TalentFlowDB extends Dexie {
  jobs!: Table<Job>
  candidates!: Table<Candidate>
  candidateTimeline!: Table<CandidateTimeline>
  candidateNotes!: Table<CandidateNote>
  assessments!: Table<Assessment>
  assessmentResponses!: Table<AssessmentResponse>

  constructor() {
    super("TalentFlowDB")
    this.version(1).stores({
      jobs: "id, title, status, order, slug",
      candidates: "id, name, email, stage, jobId",
      candidateTimeline: "id, candidateId, timestamp",
      candidateNotes: "id, candidateId, createdAt",
      assessments: "id, jobId",
      assessmentResponses: "id, assessmentId, candidateId",
    })
  }
}

export const db = new TalentFlowDB()
