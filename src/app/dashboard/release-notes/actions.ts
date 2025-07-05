'use server';

import { createServerClient } from '@supabase/ssr'; // Using ssr client for server actions
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// --- HARDCODED USER ID (Remove later when auth is fixed) ---
const HARDCODED_USER_ID = '177131ef-b580-4343-9d46-7704c14a0230';
// ----------------------------------------------------------

function createSupabaseServerClient() {
    const cookieStore = cookies();
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                // We might not need set/remove in read-only server actions
                // but keeping them for consistency with middleware pattern
                set(name: string, value: string, options: any) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: any) {
                    cookieStore.delete({ name, ...options });
                },
            },
        }
    );
}

// Type definition for a release note (adjust based on your actual schema if needed)
type ReleaseNote = Database['public']['Tables']['release_notes']['Row'];

export async function getReleaseNotesList(): Promise<ReleaseNote[]> {
    console.log(`Fetching release notes for hardcoded user: ${HARDCODED_USER_ID}`);
    const supabase = createSupabaseServerClient();

    try {
        // 1. Find the organization(s) the hardcoded user belongs to
        //    (Assuming one active org for simplicity now)
        const { data: membership, error: membershipError } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', HARDCODED_USER_ID)
            .limit(1)
            .single(); // Expecting only one for now

        if (membershipError || !membership) {
            console.error('Error fetching user organization membership:', membershipError);
            throw new Error('Could not find organization for user.');
        }

        const organizationId = membership.organization_id;
        console.log(`User belongs to organization: ${organizationId}`);

        // 2. Fetch release notes for that organization
        const { data: releaseNotes, error: notesError } = await supabase
            .from('release_notes')
            .select('*') // Select all columns for now
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false }); // Order by creation date

        if (notesError) {
            console.error('Error fetching release notes:', notesError);
            throw new Error('Could not fetch release notes.');
        }

        console.log(`Found ${releaseNotes?.length ?? 0} release notes.`);
        return releaseNotes || [];

    } catch (error) {
        console.error('Error in getReleaseNotesList:', error);
        return []; // Return empty array on error
    }
}

// Add other actions (create, update, delete) here later 