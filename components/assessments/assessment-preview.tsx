"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { AssessmentSection, Question } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Upload } from "lucide-react"

interface AssessmentPreviewProps {
  title: string
  sections: AssessmentSection[]
}

export function AssessmentPreview({ title, sections }: AssessmentPreviewProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateResponse = (questionId: string, value: any) => {
    setResponses({ ...responses, [questionId]: value })
    if (errors[questionId]) {
      const newErrors = { ...errors }
      delete newErrors[questionId]
      setErrors(newErrors)
    }
  }

  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalOn) return true

    const dependentValue = responses[question.conditionalOn.questionId]
    if (!dependentValue) return false

    if (Array.isArray(question.conditionalOn.value)) {
      return question.conditionalOn.value.includes(dependentValue)
    }

    return dependentValue === question.conditionalOn.value
  }

  const validateQuestion = (question: Question): string | null => {
    const value = responses[question.id]

    if (question.required && !value) {
      return "This field is required"
    }

    if (question.type === "numeric" && value) {
      const num = Number(value)
      if (question.validation?.min !== undefined && num < question.validation.min) {
        return `Value must be at least ${question.validation.min}`
      }
      if (question.validation?.max !== undefined && num > question.validation.max) {
        return `Value must be at most ${question.validation.max}`
      }
    }

    if ((question.type === "short-text" || question.type === "long-text") && value) {
      if (question.validation?.maxLength && value.length > question.validation.maxLength) {
        return `Maximum ${question.validation.maxLength} characters allowed`
      }
    }

    return null
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}

    sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (shouldShowQuestion(question)) {
          const error = validateQuestion(question)
          if (error) {
            newErrors[question.id] = error
          }
        }
      })
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      alert("Assessment submitted successfully! (This is a preview)")
    }
  }

  const renderQuestion = (question: Question) => {
    if (!shouldShowQuestion(question)) return null

    const error = errors[question.id]

    return (
      <div key={question.id} className="space-y-2">
        <Label>
          {question.label}
          {question.required && <span className="text-destructive ml-1">*</span>}
          {question.conditionalOn && (
            <Badge variant="outline" className="ml-2 text-xs">
              Conditional
            </Badge>
          )}
        </Label>

        {question.type === "single-choice" && (
          <RadioGroup
            value={responses[question.id] || ""}
            onValueChange={(value) => updateResponse(question.id, value)}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === "multi-choice" && (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={(responses[question.id] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const current = responses[question.id] || []
                    const updated = checked ? [...current, option] : current.filter((v: string) => v !== option)
                    updateResponse(question.id, updated)
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )}

        {question.type === "short-text" && (
          <Input
            value={responses[question.id] || ""}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Your answer..."
            maxLength={question.validation?.maxLength}
          />
        )}

        {question.type === "long-text" && (
          <Textarea
            value={responses[question.id] || ""}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Your answer..."
            rows={4}
            maxLength={question.validation?.maxLength}
          />
        )}

        {question.type === "numeric" && (
          <Input
            type="number"
            value={responses[question.id] || ""}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Enter a number..."
            min={question.validation?.min}
            max={question.validation?.max}
          />
        )}

        {question.type === "file-upload" && (
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">(File upload is simulated in preview)</p>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {question.validation?.maxLength && (question.type === "short-text" || question.type === "long-text") && (
          <p className="text-xs text-muted-foreground">
            {(responses[question.id] || "").length} / {question.validation.maxLength} characters
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title || "Untitled Assessment"}</CardTitle>
          <CardDescription>This is a live preview of how candidates will see the assessment</CardDescription>
        </CardHeader>
      </Card>

      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {section.questions.length > 0 ? (
              section.questions.map(renderQuestion)
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No questions in this section</p>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-2">
        <Button variant="outline">Save Draft</Button>
        <Button onClick={handleSubmit}>Submit Assessment</Button>
      </div>
    </div>
  )
}
