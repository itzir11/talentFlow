"use client"

import type React from "react"

import { useDroppable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface KanbanColumnProps {
  id: string
  title: string
  count: number
  color: string
  children: React.ReactNode
}

export function KanbanColumn({ id, title, count, color, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <Card ref={setNodeRef} className={`${isOver ? "ring-2 ring-primary" : ""} transition-all`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <Badge variant="secondary" className="rounded-full">
            {count}
          </Badge>
        </div>
        <div className={`h-1 rounded-full ${color}`} />
      </CardHeader>
      <CardContent className="space-y-2 min-h-[400px]">{children}</CardContent>
    </Card>
  )
}
