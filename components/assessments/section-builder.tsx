"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import type { AssessmentSection, Question } from "@/lib/db"
import { QuestionBuilder } from "./question-builder"

interface SectionBuilderProps {
  section: AssessmentSection
  onUpdate: (section: AssessmentSection) => void
  onDelete: () => void
}

export function SectionBuilder({ section, onUpdate, onDelete }: SectionBuilderProps) {
  const addQuestion = () => {
    onUpdate({
      ...section,
      questions: [
        ...section.questions,
        {
          id: `q-${Date.now()}`,
          type: "short-text",
          label: "",
          required: false,
        },
      ],
    })
  }

  const updateQuestion = (index: number, question: Question) => {
    const newQuestions = [...section.questions]
    newQuestions[index] = question
    onUpdate({ ...section, questions: newQuestions })
  }

  const deleteQuestion = (index: number) => {
    onUpdate({
      ...section,
      questions: section.questions.filter((_, i) => i !== index),
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Input
            value={section.title}
            onChange={(e) => onUpdate({ ...section, title: e.target.value })}
            className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
            placeholder="Section Title"
          />
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {section.questions.map((question, index) => (
          <QuestionBuilder
            key={question.id}
            question={question}
            allQuestions={section.questions}
            onUpdate={(updated) => updateQuestion(index, updated)}
            onDelete={() => deleteQuestion(index)}
          />
        ))}
        <Button onClick={addQuestion} variant="outline" size="sm" className="w-full bg-transparent">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </CardContent>
    </Card>
  )
}
