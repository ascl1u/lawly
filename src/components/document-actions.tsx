import * as React from "react"
import { MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useState } from 'react'

interface DocumentActionsProps {
  onDelete: () => Promise<void>
  status: 'pending' | 'parsing' | 'analyzed' | 'error'
  onAnalyze?: () => Promise<void>
}

export function DocumentActions({ onDelete, status, onAnalyze }: DocumentActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAnalyzing(true)
    try {
      await onAnalyze?.()
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {status === 'pending' && (
          <DropdownMenuItem
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="text-accent hover:text-accent hover:bg-accent/10"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {isDeleting ? 'Deleting...' : 'Delete Document'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 