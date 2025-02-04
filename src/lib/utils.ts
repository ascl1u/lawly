import { v4 as uuidv4 } from 'uuid'

export function generateUUID(): string {
  // Try native crypto first
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback to uuid package
  return uuidv4()
} 