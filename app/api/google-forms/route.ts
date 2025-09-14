import { NextRequest, NextResponse } from 'next/server';
import { fetchGoogleFormSubmissions, processFormSubmission } from '@/utils/googleForms';

// GET endpoint to fetch and process all form submissions
export async function GET() {
  try {
    const submissions = await fetchGoogleFormSubmissions();
    const processedProofs = await Promise.all(
      submissions.map(submission => processFormSubmission(submission))
    );
    
    return NextResponse.json({
      success: true,
      data: processedProofs,
      count: processedProofs.length
    });
    
  } catch (error) {
    console.error('Error processing Google Form submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process form submissions' },
      { status: 500 }
    );
  }
}

// POST endpoint to process a specific form submission
export async function POST(request: NextRequest) {
  try {
    const { formId } = await request.json();
    
    if (!formId) {
      return NextResponse.json(
        { success: false, error: 'Form ID is required' },
        { status: 400 }
      );
    }
    
    // Process specific form
    const submissions = await fetchGoogleFormSubmissions();
    const processedProofs = await Promise.all(
      submissions.map(submission => processFormSubmission(submission))
    );
    
    return NextResponse.json({
      success: true,
      data: processedProofs,
      message: `Processed ${processedProofs.length} submissions from form ${formId}`
    });
    
  } catch (error) {
    console.error('Error processing form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process form' },
      { status: 500 }
    );
  }
}