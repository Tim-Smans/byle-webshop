// app/api/cv/route.ts
import { supabase } from '@/lib/supabase/client'
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
  const adminRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/me`, {
    headers: req.headers,
  })
  const { isAdmin } = await adminRes.json()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { error } = await supabase
    .from('CvPage')
    .update({ content: body })
    .eq('id', 1)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}