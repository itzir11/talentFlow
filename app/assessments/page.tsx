"use client"

import { useState } from "react"
import useSWR from "swr"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, ClipboardList } from "lucide-react"
import Link from "next/link"

export default function AssessmentsPage() {
  const [search, setSearch] = useState("")

  const { data: jobs, isLoading } = useSWR("assessments-jobs", async () => {
    return await db.jobs.where("status").equals("active").toArray()
  })

  const { data: assessments } = useSWR("assessments-list", async () => {
    return await db.assessments.toArray()
  })

  const filteredJobs = jobs?.filter((job) => job.title.toLowerCase().includes(search.toLowerCase()))

  const getAssessmentForJob = (jobId: string) => {
    return assessments?.find((a) => a.jobId === jobId)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Assessments</h1>
              <p className="text-muted-foreground">Create and manage job-specific assessments</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        )}

        {filteredJobs && filteredJobs.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">No active jobs found</p>
            </CardContent>
          </Card>
        )}

        {filteredJobs && filteredJobs.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const assessment = getAssessmentForJob(job.id)
              return (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <ClipboardList className="w-5 h-5 text-muted-foreground" />
                      {assessment ? (
                        <Badge variant="default">Has Assessment</Badge>
                      ) : (
                        <Badge variant="secondary">No Assessment</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription>
                      {assessment
                        ? `${assessment.sections.length} sections, ${assessment.sections.reduce((acc, s) => acc + s.questions.length, 0)} questions`
                        : "No assessment created yet"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/assessments/${job.id}`}>
                      <Button className="w-full">
                        {assessment ? (
                          <>
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Edit Assessment
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Assessment
                          </>
                        )}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
