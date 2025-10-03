"use client"

import { use, useState } from "react"
import useSWR from "swr"
import { db, type CandidateNote } from "@/lib/db"
import { api } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Mail, Phone, Clock } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const STAGE_COLORS = {
  applied: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  screen: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  tech: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  offer: "bg-green-500/10 text-green-700 dark:text-green-300",
  hired: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-300",
}

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [noteContent, setNoteContent] = useState("")
  const [isSavingNote, setIsSavingNote] = useState(false)
  const { toast } = useToast()

  const { data: candidate, isLoading } = useSWR(`candidate-${id}`, async () => {
    return await db.candidates.get(id)
  })

  const { data: timeline, mutate: mutateTimeline } = useSWR(`candidate-${id}-timeline`, async () => {
    return await api.candidates.getTimeline(id)
  })

  const { data: job } = useSWR(candidate ? `job-${candidate.jobId}` : null, async () => {
    return candidate ? await db.jobs.get(candidate.jobId) : null
  })

  const { data: notes, mutate: mutateNotes } = useSWR(`candidate-${id}-notes`, async () => {
    return await db.candidateNotes.where("candidateId").equals(id).reverse().sortBy("createdAt")
  })

  const handleAddNote = async () => {
    if (!noteContent.trim()) return

    setIsSavingNote(true)
    try {
      // Extract @mentions
      const mentions = noteContent.match(/@(\w+)/g)?.map((m) => m.substring(1)) || []

      const newNote: CandidateNote = {
        id: `note-${Date.now()}`,
        candidateId: id,
        content: noteContent,
        mentions,
        createdAt: new Date().toISOString(),
        createdBy: "Current User",
      }

      await db.candidateNotes.add(newNote)
      setNoteContent("")
      mutateNotes()
      toast({
        title: "Note added",
        description: "Your note has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingNote(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading candidate details...</p>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Candidate not found</p>
            <Link href="/candidates">
              <Button>Back to Candidates</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/candidates">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Candidates
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{candidate.name}</h1>
              <div className="flex flex-wrap gap-3 text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {candidate.email}
                </span>
                {candidate.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {candidate.phone}
                  </span>
                )}
              </div>
              {job && (
                <Link href={`/jobs/${job.id}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                    Applied to: {job.title}
                  </Badge>
                </Link>
              )}
            </div>
            <Badge className={STAGE_COLORS[candidate.stage]}>{candidate.stage}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>Candidate progression through hiring stages</CardDescription>
              </CardHeader>
              <CardContent>
                {timeline && timeline.length > 0 ? (
                  <div className="space-y-4">
                    {timeline.map((entry, index) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          {index < timeline.length - 1 && <div className="w-0.5 h-full bg-border mt-1" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            {entry.fromStage && (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  {entry.fromStage}
                                </Badge>
                                <span className="text-muted-foreground">→</span>
                              </>
                            )}
                            <Badge className="text-xs">{entry.toStage}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No timeline entries yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Add notes with @mentions for team collaboration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note... Use @name to mention team members"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleAddNote} disabled={!noteContent.trim() || isSavingNote}>
                    {isSavingNote ? "Saving..." : "Add Note"}
                  </Button>
                </div>

                {notes && notes.length > 0 ? (
                  <div className="space-y-3 mt-6">
                    {notes.map((note) => (
                      <Card key={note.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium">{note.createdBy}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(note.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">
                            {note.content.split(/(@\w+)/g).map((part, i) =>
                              part.startsWith("@") ? (
                                <span key={i} className="text-primary font-medium">
                                  {part}
                                </span>
                              ) : (
                                part
                              ),
                            )}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <a href={`mailto:${candidate.email}`}>Send Email</a>
                </Button>
                {candidate.phone && (
                  <Button className="w-full bg-transparent" variant="outline" asChild>
                    <a href={`tel:${candidate.phone}`}>Call Candidate</a>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Applied:</span>
                  <p className="font-medium">{new Date(candidate.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p className="font-medium">{new Date(candidate.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Stage:</span>
                  <p className="font-medium capitalize">{candidate.stage}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
