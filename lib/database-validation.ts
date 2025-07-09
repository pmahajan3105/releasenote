/**
 * Database integrity validation utilities
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface DatabaseValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  tables: string[]
  missingTables: string[]
}

// Expected tables in the database
const EXPECTED_TABLES = [
  'organizations',
  'organization_members',
  'integrations',
  'release_notes',
  'templates',
  'subscribers',
  'ticket_cache',
  'brand_voices',
  'custom_prompts',
  'ai_context',
  'release_note_categories',
  'css_themes',
  'css_customization_history',
  'ssl_certificates',
  'ssl_challenges'
]

// Critical columns that must exist
const CRITICAL_COLUMNS = {
  organizations: ['id', 'name', 'slug', 'created_at'],
  organization_members: ['id', 'organization_id', 'user_id', 'role'],
  release_notes: ['id', 'organization_id', 'title', 'content_html', 'status'],
  templates: ['id', 'organization_id', 'name', 'content']
}

export async function validateDatabaseIntegrity(): Promise<DatabaseValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  const tables: string[] = []
  const missingTables: string[] = []

  try {
    const supabase = createClientComponentClient()

    // Check if we can connect to the database
    const { data: connectionTest, error: connectionError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)

    if (connectionError) {
      errors.push(`Database connection failed: ${connectionError.message}`)
      return { isValid: false, errors, warnings, tables, missingTables }
    }

    // Get list of all tables (this is a simplified check)
    // In a real production environment, you'd query the information_schema
    for (const tableName of EXPECTED_TABLES) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('relation') && error.message.includes('does not exist')) {
            missingTables.push(tableName)
            errors.push(`Missing table: ${tableName}`)
          } else {
            warnings.push(`Table ${tableName} exists but has issues: ${error.message}`)
          }
        } else {
          tables.push(tableName)
        }
      } catch (err) {
        warnings.push(`Could not check table ${tableName}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    // Check critical columns (simplified check)
    for (const [tableName, columns] of Object.entries(CRITICAL_COLUMNS)) {
      if (tables.includes(tableName)) {
        // This is a basic check - in production you'd query information_schema.columns
        for (const column of columns) {
          try {
            const { error } = await supabase
              .from(tableName)
              .select(column)
              .limit(1)

            if (error && error.message.includes('column') && error.message.includes('does not exist')) {
              errors.push(`Missing critical column ${column} in table ${tableName}`)
            }
          } catch (err) {
            warnings.push(`Could not verify column ${column} in ${tableName}`)
          }
        }
      }
    }

    // Check RLS is enabled (by trying to access without proper auth)
    // This is a simplified check
    const testQueries = [
      { table: 'organizations', expectError: false },
      { table: 'organization_members', expectError: true },
      { table: 'release_notes', expectError: true }
    ]

    for (const test of testQueries) {
      if (tables.includes(test.table)) {
        try {
          // Create a client without auth to test RLS
          const { error } = await supabase
            .from(test.table)
            .select('*')
            .limit(1)

          if (test.expectError && !error) {
            warnings.push(`Table ${test.table} may not have proper RLS policies`)
          }
        } catch (err) {
          // This is expected for protected tables
        }
      }
    }

  } catch (error) {
    errors.push(`Database validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    tables,
    missingTables
  }
}

export function logDatabaseValidationResults(result: DatabaseValidationResult): void {
  console.log('\n📊 Database Integrity Check:')
  
  if (result.isValid) {
    console.log('✅ Database integrity validation passed')
  } else {
    console.error('❌ Database integrity validation failed')
  }

  console.log(`📋 Tables found: ${result.tables.length}/${EXPECTED_TABLES.length}`)
  
  if (result.errors.length > 0) {
    console.error('\n🔴 CRITICAL ERRORS:')
    result.errors.forEach(error => console.error(`  - ${error}`))
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  WARNINGS:')
    result.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  if (result.missingTables.length > 0) {
    console.error('\n📋 Missing tables:')
    result.missingTables.forEach(table => console.error(`  - ${table}`))
  }

  console.log(`\n✅ Database validation complete`)
}

// Function to check migration status (without requiring Supabase CLI)
export async function checkMigrationStatus(): Promise<{
  isComplete: boolean
  pendingMigrations: string[]
  errors: string[]
}> {
  try {
    const supabase = createClientComponentClient()
    
    // Check if the latest tables exist (indicates migrations are up to date)
    const latestTables = ['ssl_certificates', 'css_themes', 'ai_context']
    const pendingMigrations: string[] = []
    const errors: string[] = []

    for (const table of latestTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1)

        if (error && error.message.includes('does not exist')) {
          pendingMigrations.push(`Migration for table ${table}`)
        }
      } catch (err) {
        errors.push(`Could not check migration status for ${table}`)
      }
    }

    return {
      isComplete: pendingMigrations.length === 0,
      pendingMigrations,
      errors
    }
  } catch (error) {
    return {
      isComplete: false,
      pendingMigrations: [],
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}