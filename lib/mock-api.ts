import { http, HttpResponse } from "msw"
import { setupWorker } from "msw/browser"
import { db, type Job, type Candidate, type Assessment } from "./db"

const API_DELAY_MIN = 200
const API_DELAY_MAX = 1200
const ERROR_RATE = 0.08

function randomDelay() {
  return Math.random() * (API_DELAY_MAX - API_DELAY_MIN) + API_DELAY_MIN
}

function shouldError() {
  return Math.random() < ERROR_RATE
}

export const handlers = [
  // Jobs endpoints
  http.get("/api/jobs", async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, randomDelay()))

    const url = new URL(request.url)
    const search = url.searchParams.get("search") || ""
    const status = url.searchParams.get("status") || ""
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "10")
    const sort = url.searchParams.get("sort") || "order"

    let jobs = await db.jobs.toArray()

    // Filter
    if (search) {
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
      )
    }

    if (status) {
      jobs = jobs.filter((job) => job.status === status)
    }

    // Sort
    if (sort === "order") {
      jobs.sort((a, b) => a.order - b.order)
    } else if (sort === "title") {
      jobs.sort((a, b) => a.title.localeCompare(b.title))
    }

    // Paginate
    const total = jobs.length
    const start = (page - 1) * pageSize
    const paginatedJobs = jobs.slice(start, start + pageSize)

    return HttpResponse.json({
      data: paginatedJobs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  }),

  // http.post("/api/jobs", ...)
  http.post("/api/jobs", async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, randomDelay()))

    if (shouldError()) {
      return HttpResponse.json({ error: "Failed to create job" }, { status: 500 })
    }

    const body = ((await request.json()) ?? {}) as Partial<Job>

    const existingJobs = await db.jobs.toArray()
    const nextOrder = (existingJobs.reduce((max, j) => Math.max(max, j.order), 0) || 0) + 1

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: body.title ?? "Untitled Job",
      slug:
        body.slug ??
        (body.title ? body.title.toLowerCase().replace(/\s+/g, "-") : `job-${Date.now()}`),
      status: body.status ?? "active",
      tags: body.tags ?? [],
      order: typeof body.order === "number" ? body.order : nextOrder,
      description: body.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.jobs.add(newJob)
    return HttpResponse.json(newJob)
  }),

  http.patch("/api/jobs/:id", async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, randomDelay()))

    if (shouldError()) {
      return HttpResponse.json({ error: "Failed to update job" }, { status: 500 })
    }

    const { id } = params
    const updates = ((await request.json()) ?? {}) as Partial<Job>

    await db.jobs.update(id as string, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })

    const updatedJob = await db.jobs.get(id as string)
    return HttpResponse.json(updatedJob)
  }),

  http.patch("/api/jobs/:id/reorder", async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, randomDelay()))

    // Higher error rate for reorder to test rollback
    if (Math.random() < 0.1) {
      return HttpResponse.json({ error: "Failed to reorder jobs" }, { status: 500 })
    }

    const { id } = params
    const { fromOrder, toOrder } = ((await request.json()) ?? {}) as {
      fromOrder: number
      toOrder: number
    }

    const jobs = await db.jobs.orderBy("order").toArray()
    const job = jobs.find((j) => j.id === id)

    if (!job) {
      return HttpResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Reorder logic
    if (fromOrder < toOrder) {
      // Moving down
      for (const j of jobs) {
        if (j.order > fromOrder && j.order <= toOrder) {
          await db.jobs.update(j.id, { order: j.order - 1 })
        }
      }
    } else {
      // Moving up
      for (const j of jobs) {
        if (j.order >= toOrder && j.order < fromOrder) {
          await db.jobs.update(j.id, { order: j.order + 1 })
        }
      }
    }

    await db.jobs.update(id as string, { order: toOrder })

    return HttpResponse.json({ success: true })
  }),

  // Candidates endpoints
  http.get("/api/candidates", async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, randomDelay()))

    const url = new URL(request.url)
    const search = url.searchParams.get("search") || ""
    const stage = url.searchParams.get("stage") || ""
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "50")

    let candidates = await db.candidates.toArray()

    // Filter
    if (search) {
      candidates = candidates.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (stage) {
      candidates = candidates.filter((c) => c.stage === stage)
    }

    // Paginate
    const total = candidates.length
    const start = (page - 1) * pageSize
    const paginatedCandidates = candidates.slice(start, start + pageSize)

    return HttpResponse.json({
      data: paginatedCandidates,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  }),

  // http.post("/api/candidates", ...)
  http.post("/api/candidates", async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, randomDelay()))

    if (shouldError()) {
      return HttpResponse.json({ error: "Failed to create candidate" }, { status: 500 })
    }

    const body = ((await request.json()) ?? {}) as Partial<Candidate>
    const newCandidate: Candidate = {
      id: `candidate-${Date.now()}`,
      name: body.name ?? "Unnamed Candidate",
      email: body.email ?? "",
      stage: body.stage ?? "applied",
      jobId: body.jobId ?? "",
      phone: body.phone,
      resume: body.resume,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  
    await db.candidates.add(newCandidate)
  
    // Add timeline entry
    await db.candidateTimeline.add({
      id: `timeline-${Date.now()}`,
      candidateId: newCandidate.id,
      fromStage: null,
      toStage: "applied",
      timestamp: new Date().toISOString(),
    })
  
    return HttpResponse.json(newCandidate)
  }),

  http.patch("/api/candidates/:id", async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, randomDelay()))

    if (shouldError()) {
      return HttpResponse.json({ error: "Failed to update candidate" }, { status: 500 })
    }

    const { id } = params
    const updates = ((await request.json()) ?? {}) as Partial<Candidate>

    const candidate = await db.candidates.get(id as string)

    if (updates.stage && candidate && updates.stage !== candidate.stage) {
      await db.candidateTimeline.add({
        id: `timeline-${Date.now()}`,
        candidateId: id as string,
        fromStage: candidate.stage,
        toStage: updates.stage,
        timestamp: new Date().toISOString(),
      })
    }

    await db.candidates.update(id as string, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })

    const updatedCandidate = await db.candidates.get(id as string)
    return HttpResponse.json(updatedCandidate)
  }),

  http.get("/api/candidates/:id/timeline", async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, randomDelay()))

    const { id } = params
    const timeline = await db.candidateTimeline
      .where("candidateId")
      .equals(id as string)
      .sortBy("timestamp")

    return HttpResponse.json(timeline)
  }),

  // Assessments endpoints
  http.get("/api/assessments/:jobId", async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, randomDelay()))

    const { jobId } = params
    const assessment = await db.assessments.get({ jobId: jobId as string })

    return HttpResponse.json(assessment || null)
  }),

  // http.put("/api/assessments/:jobId", ...)
  http.put("/api/assessments/:jobId", async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, randomDelay()))

    if (shouldError()) {
      return HttpResponse.json({ error: "Failed to save assessment" }, { status: 500 })
    }

    const { jobId } = params
    const body = ((await request.json()) ?? {}) as Partial<Assessment>

    const existing = await db.assessments.get({ jobId: jobId as string })

    if (existing) {
      await db.assessments.update(existing.id, {
        ...body,
        updatedAt: new Date().toISOString(),
      })
      const updated = await db.assessments.get(existing.id)
      return HttpResponse.json(updated)
    } else {
      const newAssessment: Assessment = {
        id: `assessment-${Date.now()}`,
        jobId: jobId as string,
        title: body.title ?? "Assessment",
        sections: body.sections ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await db.assessments.add(newAssessment)
      return HttpResponse.json(newAssessment)
    }
  }),

  http.post("/api/assessments/:jobId/submit", async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, randomDelay()))

    if (shouldError()) {
      return HttpResponse.json({ error: "Failed to submit assessment" }, { status: 500 })
    }

    const { jobId } = params
    const body = ((await request.json()) ?? {}) as {
      assessmentId: string
      candidateId: string
      responses: Record<string, any>
    }

    const response = {
      id: `response-${Date.now()}`,
      assessmentId: body.assessmentId,
      candidateId: body.candidateId,
      responses: body.responses,
      submittedAt: new Date().toISOString(),
    }

    await db.assessmentResponses.add(response)
    return HttpResponse.json(response)
  }),
]

export const worker = setupWorker(...handlers)
