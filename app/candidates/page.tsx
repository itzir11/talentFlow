"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import Link from "next/link"
import { CandidatesList } from "@/components/candidates/candidates-list"
import { CandidatesKanban } from "@/components/candidates/candidates-kanban"

export default function CandidatesPage() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"list" | "kanban">("list")

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Candidates</h1>
              <p className="text-muted-foreground">Manage and track candidates through the hiring pipeline</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={view} onValueChange={(v) => setView(v as "list" | "kanban")}>
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {view === "list" ? <CandidatesList search={search} /> : <CandidatesKanban search={search} />}
      </div>
    </div>
  )
}
