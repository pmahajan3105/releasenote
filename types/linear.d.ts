// Minimal type for ProjectFilterInput to satisfy TS/ESLint
export interface ProjectFilterInput {
  team?: {
    id?: {
      eq?: string
    }
  }
}
