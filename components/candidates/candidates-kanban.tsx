"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { db, type Candidate } from "@/lib/db"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import Link from "next/link"

interface CandidatesKanbanProps {
  search: string
}

const STAGES = [
  { id: "applied", label: "Applied", color: "bg-blue-500" },
  { id: "screen", label: "Screening", color: "bg-purple-500" },
  { id: "tech", label: "Technical", color: "bg-orange-500" },
  { id: "offer", label: "Offer", color: "bg-green-500" },
  { id: "hired", label: "Hired", color: "bg-emerald-500" },
  { id: "rejected", label: "Rejected", color: "bg-red-500" },
]

export function CandidatesKanban({ search }: CandidatesKanbanProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const { toast } = useToast()

  const { data, isLoading, mutate } = useSWR(
    ["candidates-kanban", search],
    async () => {
      let allCandidates = await db.candidates.toArray()

      if (search) {
        allCandidates = allCandidates.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()),
        )
      }

      return allCandidates
    },
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (data) {
      setCandidates(data)
    }
  }, [data])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeCandidate = candidates.find((c) => c.id === activeId)
    if (!activeCandidate) return

    // Check if dropped on a stage column
    const targetStage = STAGES.find((s) => s.id === overId)
    if (targetStage && activeCandidate.stage !== targetStage.id) {
      // Optimistic update
      setCandidates((prev) => prev.map((c) => (c.id === activeId ? { ...c, stage: targetStage.id as any } : c)))

      try {
        await api.candidates.update(activeId, { stage: targetStage.id })
        toast({
          title: "Candidate moved",
          description: `${activeCandidate.name} moved to ${targetStage.label}`,
        })
        mutate()
      } catch (error) {
        // Rollback on error
        setCandidates(data || [])
        toast({
          title: "Failed to move candidate",
          description: "Could not update candidate stage. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const getCandidatesByStage = (stage: string) => {
    return candidates.filter((c) => c.stage === stage)
  }

  const activeCandidate = activeId ? candidates.find((c) => c.id === activeId) : null

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading candidates...</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAGES.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage.id)
          return (
            <KanbanColumn
              key={stage.id}
              id={stage.id}
              title={stage.label}
              count={stageCandidates.length}
              color={stage.color}
            >
              <SortableContext items={stageCandidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {stageCandidates.map((candidate) => (
                    <Link href={`/candidates/${candidate.id}`} key={candidate.id}>
                      <KanbanCard candidate={candidate} />
                    </Link>
                  ))}
                </div>
              </SortableContext>
            </KanbanColumn>
          )
        })}
      </div>

      <DragOverlay>{activeCandidate ? <KanbanCard candidate={activeCandidate} isDragging /> : null}</DragOverlay>
    </DndContext>
  )
}
