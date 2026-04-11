import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const service = createServiceRoleClient()

  const [profile, subscription, generations, clients, properties, templates, favorites] = await Promise.all([
    service.from('profiles').select('*').eq('id', user.id).single(),
    service.from('rp_subscriptions')
      .select('status, trial_generations_used, trial_generations_limit, current_period_end')
      .eq('user_id', user.id)
      .single(),
    service.from('rp_generations')
      .select('id, original_message, reply_professional, reply_friendly, reply_direct, detected_language, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    service.from('rp_clients').select('*').eq('user_id', user.id),
    service.from('rp_properties').select('*').eq('user_id', user.id),
    service.from('rp_templates').select('*').eq('user_id', user.id).eq('is_system', false),
    service.from('rp_favorites')
      .select('id, tone, content, label, created_at')
      .eq('user_id', user.id),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    gdpr_note: 'This export contains all personal data held by ReplyPro in accordance with GDPR Article 20 (Right to Data Portability).',
    user: { id: user.id, email: user.email },
    profile: profile.data ?? null,
    subscription: subscription.data ?? null,
    generations: generations.data ?? [],
    clients: clients.data ?? [],
    properties: properties.data ?? [],
    templates: templates.data ?? [],
    favorites: favorites.data ?? [],
  }

  const date = new Date().toISOString().split('T')[0]
  const json = JSON.stringify(exportData, null, 2)

  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="replypro-data-export-${date}.json"`,
    },
  })
}
