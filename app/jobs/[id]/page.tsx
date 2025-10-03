"use client"

import { use } from "react"
import useSWR from "swr"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, ClipboardList } from "lucide-react"
import Link from "next/link"

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: job, isLoading } = useSWR(`job-${id}`, async () => {
    return await db.jobs.get(id)
  })

  const { data: candidates } = useSWR(`job-${id}-candidates`, async () => {
    return await db.candidates.where("jobId").equals(id).toArray()
  })

  const { data: assessment } = useSWR(`job-${id}-assessment`, async () => {
    return await db.assessments.where("jobId").equals(id).first()
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Job not found</p>
            <Link href="/jobs">
              <Button>Back to Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const candidatesByStage = candidates?.reduce(
    (acc, candidate) => {
      acc[candidate.stage] = (acc[candidate.stage] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/jobs">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
            {job.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{job.description || "No description provided."}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Candidate Pipeline</CardTitle>
                <CardDescription>Distribution of candidates across hiring stages</CardDescription>
              </CardHeader>
              <CardContent>
                {candidates && candidates.length > 0 ? (
                  <div className="space-y-3">
                    {["applied", "screen", "tech", "offer", "hired", "rejected"].map((stage) => (
                      <div key={stage} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{stage}</span>
                        <Badge variant="secondary">{candidatesByStage?.[stage] || 0}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No candidates yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{candidates?.length || 0}</div>
                <p className="text-sm text-muted-foreground mb-4">Total applicants</p>
                <Link href={`/candidates?jobId=${job.id}`}>
                  <Button className="w-full bg-transparent" variant="outline">
                    View All Candidates
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessment ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">{assessment.title}</p>
                    <Link href={`/assessments/${job.id}`}>
                      <Button className="w-full bg-transparent" variant="outline">
                        View Assessment
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">No assessment created</p>
                    <Link href={`/assessments/${job.id}`}>
                      <Button className="w-full">Create Assessment</Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
