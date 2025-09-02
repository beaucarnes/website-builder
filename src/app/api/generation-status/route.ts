// src/app/api/generation-status/route.ts
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');

  if (!siteId) {
    return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
  }

  try {
    const { rows } = await sql`
      SELECT htmlCode FROM websites WHERE id = ${siteId};
    `;
    
    // If we have a row and htmlCode is not null/empty, it's complete.
    if (rows.length > 0 && rows[0].htmlcode) {
      return NextResponse.json({ status: 'COMPLETED', site: rows[0] });
    } else {
      return NextResponse.json({ status: 'PENDING' });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

// Ensure dynamic execution for polling
export const dynamic = 'force-dynamic';