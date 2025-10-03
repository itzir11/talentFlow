"use client"

import { useState } from "react"
import useSWR from "swr"
import { api } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Virtuoso } from "react-virtuoso"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Mail, Phone } from "lucide-react"
import type { Candidate } from "@/lib/db"

interface CandidatesListProps {
  search: string
}

const STAGE_COLORS = {
  applied: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  screen: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  tech: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  offer: "bg-green-500/10 text-green-700 dark:text-green-300",
  hired: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-300",
}

export function CandidatesList({ search }: CandidatesListProps) {
  const [stage, setStage] = useState<string>("all")
  const [page, setPage] = useState(1)

  const { data, error, isLoading } = useSWR(
    ["candidates-list", search, stage, page],
    () =>
      api.candidates.list({
        search,
        stage: stage === "all" ? undefined : stage,
        page,
        pageSize: 50,
      }),
    { revalidateOnFocus: false },
  )

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading candidates...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load candidates. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">No candidates found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select
          value={stage}
          onValueChange={(value) => {
            setStage(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="screen">Screen</SelectItem>
            <SelectItem value="tech">Technical</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Showing {data.data.length} of {data.pagination.total} candidates
        </p>
      </div>

      <Card>
        <Virtuoso
          style={{ height: "600px" }}
          data={data.data}
          itemContent={(index, candidate: Candidate) => (
            <Link href={`/candidates/${candidate.id}`} key={candidate.id}>
              <div className="p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">{candidate.name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {candidate.email}
                      </span>
                      {candidate.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {candidate.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className={STAGE_COLORS[candidate.stage]}>{candidate.stage}</Badge>
                </div>
              </div>
            </Link>
          )}
        />
      </Card>

      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
    </div>
  )
}
