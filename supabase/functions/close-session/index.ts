import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Edge Function: Close Session
 * Called via navigator.sendBeacon when user closes tab/window
 * Updates session duration and user's total active minutes
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { session_id, user_id, logout_at } = await req.json()

    if (!session_id || !user_id) {
      console.log('Missing session_id or user_id')
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Closing session ${session_id} for user ${user_id}`)

    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get session start time
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('login_at')
      .eq('id', session_id)
      .single()

    if (sessionError || !sessionData) {
      console.error('Error fetching session:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate duration
    const loginAt = new Date(sessionData.login_at)
    const logoutTime = logout_at ? new Date(logout_at) : new Date()
    const durationMinutes = Math.max(0, Math.round((logoutTime.getTime() - loginAt.getTime()) / (1000 * 60)))

    console.log(`Session duration: ${durationMinutes} minutes`)

    // Update session
    const { error: updateSessionError } = await supabase
      .from('sessions')
      .update({
        logout_at: logoutTime.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq('id', session_id)

    if (updateSessionError) {
      console.error('Error updating session:', updateSessionError)
    }

    // Get current user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('total_active_minutes')
      .eq('id', user_id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
    }

    // Update user's total active time
    if (profileData) {
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          last_logout_at: logoutTime.toISOString(),
          total_active_minutes: (profileData.total_active_minutes || 0) + durationMinutes,
        })
        .eq('id', user_id)

      if (updateProfileError) {
        console.error('Error updating profile:', updateProfileError)
      }
    }

    console.log('Session closed successfully')

    return new Response(
      JSON.stringify({ success: true, duration_minutes: durationMinutes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in close-session function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
