import { NextRequest, NextResponse } from 'next/server';
import { processZipFile, ProofSubmission } from '@/utils/zipProcessor';

// Import the Google Forms logic directly instead of making HTTP requests
async function fetchFormSubmissions(): Promise<ProofSubmission[]> {
  try {
    // Import and call the Google Forms function directly
    const { fetchGoogleFormSubmissions, processFormSubmission } = await import('@/app/api/google-forms/route');
    
    // Get the raw submissions from Google Sheets
    const submissions = await fetchGoogleFormSubmissions();
    
    // Process them into the expected format
    const processedProofs = await Promise.all(
      submissions.map(submission => processFormSubmission(submission))
    );
    
    return processedProofs;
    
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
