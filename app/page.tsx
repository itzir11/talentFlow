import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, ClipboardList } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-balance">Welcome to TalentFlow</h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            A modern hiring platform for managing jobs, candidates, and assessments
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Jobs</CardTitle>
              <CardDescription>Create, edit, and manage job postings with drag-and-drop reordering</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/jobs">
                <Button className="w-full">Manage Jobs</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Candidates</CardTitle>
              <CardDescription>Track candidates through hiring stages with a kanban board</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/candidates">
                <Button className="w-full">View Candidates</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Assessments</CardTitle>
              <CardDescription>Build custom assessments with various question types</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/assessments">
                <Button className="w-full">Create Assessments</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">Built with Next.js, React, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}
