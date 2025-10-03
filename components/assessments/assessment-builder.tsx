"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import type { AssessmentSection } from "@/lib/db"
import { SectionBuilder } from "./section-builder"

interface AssessmentBuilderProps {
  title: string
  setTitle: (title: string) => void
  sections: AssessmentSection[]
  setSections: (sections: AssessmentSection[]) => void
}

export function AssessmentBuilder({ title, setTitle, sections, setSections }: AssessmentBuilderProps) {
  const addSection = () => {
    setSections([
      ...sections,
      {
        id: `section-${Date.now()}`,
        title: `Section ${sections.length + 1}`,
        questions: [],
      },
    ])
  }

  const updateSection = (index: number, section: AssessmentSection) => {
    const newSections = [...sections]
    newSections[index] = section
    setSections(newSections)
  }

  const deleteSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="assessment-title">Assessment Title</Label>
            <Input
              id="assessment-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Frontend Technical Assessment"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <SectionBuilder
            key={section.id}
            section={section}
            onUpdate={(updated) => updateSection(index, updated)}
            onDelete={() => deleteSection(index)}
          />
        ))}
      </div>

      <Button onClick={addSection} variant="outline" className="w-full bg-transparent">
        <Plus className="w-4 h-4 mr-2" />
        Add Section
      </Button>
    </div>
  )
}
