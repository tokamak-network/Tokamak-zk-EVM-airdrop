import { NextRequest, NextResponse } from 'next/server';
import { processZipFile, ProofSubmission } from '@/utils/zipProcessor';

// Fetch form submissions from Google Forms
async function fetchFormSubmissions(): Promise<ProofSubmission[]> {
  try {
    // Make HTTP request to the Google Forms API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/google-forms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch Google Forms submissions:', response.status, response.statusText);
      return [];
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data || result.data.length === 0) {
      console.log('No form submissions found, returning empty array');
      return [];
    }
    
    return result.data;
    
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    return [];
  }
}

// GET endpoint to fetch all proofs
export async function GET() {
  try {
    const proofs = await fetchFormSubmissions();
    
    return NextResponse.json({
      success: true,
      data: proofs,
      count: proofs.length
    });
    
  } catch (error) {
    console.error('Error fetching proofs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch proofs' },
      { status: 500 }
    );
  }
}

// POST endpoint to process new proof submission
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const zipFile = formData.get('zipFile') as File;
    const submitterAddress = formData.get('submitterAddress') as string;
    
    if (!zipFile) {
      return NextResponse.json(
        { success: false, error: 'No zip file provided' },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const zipBuffer = Buffer.from(await zipFile.arrayBuffer());
    
    // Process the zip file
    const processedData = await processZipFile(zipBuffer);
    
    // Create proof submission
    const proofSubmission: ProofSubmission = {
      id: Date.now().toString(),
      submitterAddress: submitterAddress || processedData.submitterAddress || '',
      hash: processedData.hash || '',
      status: processedData.status || '0',
      proveTime: processedData.proveTime || '00:00:00',
      submissionTime: new Date().toISOString(),
      proofData: {
        transactionHash: processedData.proofData?.transactionHash,
      }
    };
    
    // In production, you would save this to a database
    // For now, we'll just return the processed data
    
    return NextResponse.json({
      success: true,
      data: proofSubmission,
      message: 'Proof processed successfully'
    });
    
  } catch (error) {
    console.error('Error processing proof submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process proof submission' },
      { status: 500 }
    );
  }
}
