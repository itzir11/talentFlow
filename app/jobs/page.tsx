"use client"

import { useState } from "react"
import useSWR from "swr"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { JobDialog } from "@/components/jobs/job-dialog"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableJobCard } from "@/components/jobs/sortable-job-card"
import { useToast } from "@/hooks/use-toast"
import type { Job } from "@/lib/db"

export default function JobsPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const { toast } = useToast()

  const { data, error, isLoading, mutate } = useSWR(
    ["jobs", search, status, page],
    () =>
      api.jobs.list({
        search,
        status: status === "all" ? undefined : status,
        page,
        pageSize: 10,
      }),
    { revalidateOnFocus: false },
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id || !data) {
      return
    }

    const jobs = data.data
    const oldIndex = jobs.findIndex((job) => job.id === active.id)
    const newIndex = jobs.findIndex((job) => job.id === over.id)

    const reorderedJobs = arrayMove(jobs, oldIndex, newIndex)

    // Optimistic update
    mutate(
      {
        ...data,
        data: reorderedJobs,
      },
      false,
    )

    try {
      await api.jobs.reorder(active.id as string, jobs[oldIndex].order, jobs[newIndex].order)
      toast({
        title: "Job reordered",
        description: "The job order has been updated successfully.",
      })
      mutate()
    } catch (error) {
      // Rollback on error
      mutate()
      toast({
        title: "Failed to reorder",
        description: "Could not update job order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleArchiveToggle = async (job: Job) => {
    try {
      await api.jobs.update(job.id, {
        status: job.status === "active" ? "archived" : "active",
      })
      toast({
        title: job.status === "active" ? "Job archived" : "Job restored",
        description: `${job.title} has been ${job.status === "active" ? "archived" : "restored"}.`,
      })
      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingJob(null)
  }

  const handleJobSaved = () => {
    mutate()
    handleDialogClose()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Jobs</h1>
              <p className="text-muted-foreground">Manage your job postings</p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title or tags..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
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

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Failed to load jobs. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {data && data.data.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground mb-4">No jobs found</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create your first job
              </Button>
            </CardContent>
          </Card>
        )}

        {data && data.data.length > 0 && (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={data.data.map((job) => job.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {data.data.map((job) => (
                    <SortableJobCard key={job.id} job={job} onEdit={handleEdit} onArchiveToggle={handleArchiveToggle} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <JobDialog open={isDialogOpen} onOpenChange={handleDialogClose} job={editingJob} onSaved={handleJobSaved} />
    </div>
  )
}
