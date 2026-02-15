import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * API endpoint for managing release note categories
 * GET: List categories for the user's organization
 * POST: Create a new category
 */

export async function GET(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: memberData, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', session.user.id)
      .single()

    if (memberError || !memberData) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Fetch categories for the organization
    const { data: categories, error: categoriesError } = await supabase
      .from('release_note_categories')
      .select('*')
      .eq('organization_id', memberData.organization_id)
      .order('name')

    if (categoriesError) {
      throw categoriesError
    }

    return NextResponse.json({
      categories: categories || []
    })

  } catch (error) {
    console.error('Categories fetch error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, color } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: memberData, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', session.user.id)
      .single()

    if (memberError || !memberData) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create the category
    const { data: newCategory, error: createError } = await supabase
      .from('release_note_categories')
      .insert([{
        organization_id: memberData.organization_id,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#7F56D9',
        slug
      }])
      .select()
      .single()

    if (createError) {
      if (createError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 409 }
        )
      }
      throw createError
    }

    return NextResponse.json({
      success: true,
      category: newCategory,
      message: `Category "${name}" created successfully`
    }, { status: 201 })

  } catch (error) {
    console.error('Category creation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
