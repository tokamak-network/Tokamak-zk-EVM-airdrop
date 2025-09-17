import { NextRequest, NextResponse } from 'next/server';
import { computeProofHash } from '@/utils/zipProcessor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('proofFile') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    const proofData = JSON.parse(text);

    const hash = computeProofHash(proofData);

    if (!hash) {
      return NextResponse.json({ error: 'Failed to compute hash' }, { status: 500 });
    }

    return NextResponse.json({ hash });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Invalid JSON or processing error' }, { status: 400 });
  }
}
