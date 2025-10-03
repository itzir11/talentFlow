"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, X } from "lucide-react"
import type { Question, QuestionType } from "@/lib/db"

interface QuestionBuilderProps {
  question: Question
  allQuestions: Question[]
  onUpdate: (question: Question) => void
  onDelete: () => void
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "single-choice", label: "Single Choice" },
  { value: "multi-choice", label: "Multiple Choice" },
  { value: "short-text", label: "Short Text" },
  { value: "long-text", label: "Long Text" },
  { value: "numeric", label: "Numeric" },
  { value: "file-upload", label: "File Upload" },
]

export function QuestionBuilder({ question, allQuestions, onUpdate, onDelete }: QuestionBuilderProps) {
  const needsOptions = question.type === "single-choice" || question.type === "multi-choice"
  const needsValidation = question.type === "numeric" || question.type === "short-text" || question.type === "long-text"

  const addOption = () => {
    onUpdate({
      ...question,
      options: [...(question.options || []), ""],
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])]
    newOptions[index] = value
    onUpdate({ ...question, options: newOptions })
  }

  const removeOption = (index: number) => {
    onUpdate({
      ...question,
      options: question.options?.filter((_, i) => i !== index),
    })
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={question.type}
                  onValueChange={(value: QuestionType) =>
                    onUpdate({
                      ...question,
                      type: value,
                      options: undefined,
                      validation: undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={question.required}
                    onCheckedChange={(checked) => onUpdate({ ...question, required: !!checked })}
                  />
                  <span className="text-sm">Required</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Label</Label>
              <Input
                value={question.label}
                onChange={(e) => onUpdate({ ...question, label: e.target.value })}
                placeholder="Enter your question..."
              />
            </div>

            {needsOptions && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeOption(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addOption} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {needsValidation && (
              <div className="space-y-2">
                <Label>Validation Rules</Label>
                <div className="grid grid-cols-2 gap-4">
                  {question.type === "numeric" && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">Min Value</Label>
                        <Input
                          type="number"
                          value={question.validation?.min || ""}
                          onChange={(e) =>
                            onUpdate({
                              ...question,
                              validation: {
                                ...question.validation,
                                min: e.target.value ? Number(e.target.value) : undefined,
                              },
                            })
                          }
                          placeholder="Min"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Max Value</Label>
                        <Input
                          type="number"
                          value={question.validation?.max || ""}
                          onChange={(e) =>
                            onUpdate({
                              ...question,
                              validation: {
                                ...question.validation,
                                max: e.target.value ? Number(e.target.value) : undefined,
                              },
                            })
                          }
                          placeholder="Max"
                        />
                      </div>
                    </>
                  )}
                  {(question.type === "short-text" || question.type === "long-text") && (
                    <div className="space-y-1">
                      <Label className="text-xs">Max Length</Label>
                      <Input
                        type="number"
                        value={question.validation?.maxLength || ""}
                        onChange={(e) =>
                          onUpdate({
                            ...question,
                            validation: {
                              ...question.validation,
                              maxLength: e.target.value ? Number(e.target.value) : undefined,
                            },
                          })
                        }
                        placeholder="Max characters"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Conditional Logic (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={question.conditionalOn?.questionId || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      onUpdate({ ...question, conditionalOn: undefined })
                    } else {
                      onUpdate({
                        ...question,
                        conditionalOn: {
                          questionId: value,
                          value: "",
                        },
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Show when..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Always show</SelectItem>
                    {allQuestions
                      .filter((q) => q.id !== question.id && (q.type === "single-choice" || q.type === "multi-choice"))
                      .map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.label || "Untitled Question"}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {question.conditionalOn && (
                  <Input
                    value={
                      typeof question.conditionalOn.value === "string"
                        ? question.conditionalOn.value
                        : question.conditionalOn.value.join(", ")
                    }
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        conditionalOn: {
                          ...question.conditionalOn!,
                          value: e.target.value,
                        },
                      })
                    }
                    placeholder="Expected value"
                  />
                )}
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
