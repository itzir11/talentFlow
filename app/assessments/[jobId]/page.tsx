"use client"

import { use, useState, useEffect } from "react"
import useSWR from "swr"
import { db, type AssessmentSection } from "@/lib/db"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { AssessmentBuilder } from "@/components/assessments/assessment-builder"
import { AssessmentPreview } from "@/components/assessments/assessment-preview"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AssessmentBuilderPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params)
  const [title, setTitle] = useState("")
  const [sections, setSections] = useState<AssessmentSection[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [view, setView] = useState<"builder" | "preview">("builder")
  const { toast } = useToast()

  const { data: job, isLoading: jobLoading } = useSWR(`job-${jobId}`, async () => {
    return await db.jobs.get(jobId)
  })

  const { data: assessment, mutate } = useSWR(`assessment-${jobId}`, async () => {
    return await api.assessments.get(jobId)
  })

  useEffect(() => {
    if (assessment) {
      setTitle(assessment.title)
      setSections(assessment.sections)
    } else if (job) {
      setTitle(`${job.title} Assessment`)
      setSections([
        {
          id: `section-${Date.now()}`,
          title: "Section 1",
          questions: [],
        },
      ])
    }
  }, [assessment, job])

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide an assessment title",
        variant: "destructive",
      })
      return
    }

    if (sections.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one section",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await api.assessments.save(jobId, {
        title,
        sections,
      })
      toast({
        title: "Assessment saved",
        description: "Your assessment has been saved successfully",
      })
      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Job not found</p>
          <Link href="/assessments">
            <Button>Back to Assessments</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/assessments">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessments
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Assessment Builder</h1>
              <p className="text-muted-foreground">{job.title}</p>
            </div>
            <div className="flex gap-2">
              <Tabs value={view} onValueChange={(v) => setView(v as "builder" | "preview")}>
                <TabsList>
                  <TabsTrigger value="builder">Builder</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Assessment"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {view === "builder" ? (
          <AssessmentBuilder title={title} setTitle={setTitle} sections={sections} setSections={setSections} />
        ) : (
          <AssessmentPreview title={title} sections={sections} />
        )}
      </div>
    </div>
  )
}
