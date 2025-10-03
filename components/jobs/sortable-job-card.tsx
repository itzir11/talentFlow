"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GripVertical, Archive, ArchiveRestore, Pencil, ExternalLink } from "lucide-react"
import type { Job } from "@/lib/db"
import Link from "next/link"

interface SortableJobCardProps {
  job: Job
  onEdit: (job: Job) => void
  onArchiveToggle: (job: Job) => void
}

export function SortableJobCard({ job, onEdit, onArchiveToggle }: SortableJobCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? "shadow-lg" : ""}>
      <CardHeader>
        <div className="flex items-start gap-4">
          <button
            className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                <CardDescription className="mb-3">{job.description}</CardDescription>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/jobs/${job.id}`}>
                  <Button variant="ghost" size="icon" title="View details">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => onEdit(job)} title="Edit job">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onArchiveToggle(job)}
                  title={job.status === "active" ? "Archive job" : "Restore job"}
                >
                  {job.status === "active" ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
