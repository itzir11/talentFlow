"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Mail } from "lucide-react"
import type { Candidate } from "@/lib/db"

interface KanbanCardProps {
  candidate: Candidate
  isDragging?: boolean
}

export function KanbanCard({ candidate, isDragging }: KanbanCardProps) {
  return (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow ${isDragging ? "opacity-50" : ""}`}>
      <CardContent className="p-3">
        <h4 className="font-semibold text-sm mb-1 truncate">{candidate.name}</h4>
        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
          <Mail className="w-3 h-3" />
          {candidate.email}
        </p>
      </CardContent>
    </Card>
  )
}
