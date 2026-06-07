// app/api/cv/route.ts
import { isAdmin } from '@/lib/auth/admin-auth'
import { supabase } from '@/lib/supabase/client'
import { processLock } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'


export async function GET() {
  const { data, error } = await supabase
    .from('CvPage')
    .select('content')
    .eq('id', 1)
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data.content)
}

export async function PATCH(req: Request) {
  // Beveilig de route
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const response = await supabase
    .from('CvPage')
    .update({ content: body })
    .eq('id', 1)

  console.log('resp:', response)
  if (response.error) return NextResponse.json({ response }, { status: 500 })
  return NextResponse.json({ ok: true })
}