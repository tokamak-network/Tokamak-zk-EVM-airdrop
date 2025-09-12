import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import JSZip from 'jszip';

// Enhanced proof data interface
export interface ProofSubmission {
  id: string;
  submitterAddress: string;
  hash: string;
  status: string;
  proveTime: string;
  submissionTime: string;
  zipFileUrl?: string;
  proofData?: {
    publicSignals?: any;
    proof?: any;
    transactionHash?: string;
  };
}

// Process zip file to extract proof data (wallet address comes from form)
export async function processZipFile(zipBuffer: Buffer): Promise<Partial<ProofSubmission>> {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipBuffer);
    
    let proofHash = '';
    let transactionHash = '';
    let proveTime = '00:00:00';
    let publicSignals = null;
    let proof = null;
    
    console.log('Zip file contents:', Object.keys(zipContent.files));
    
    // Look for specific proof files
    for (const fileName of Object.keys(zipContent.files)) {
      const file = zipContent.files[fileName];
      if (!file.dir) {
        const content = await file.async('text');
        console.log(`Processing file: ${fileName}, size: ${content.length} chars`);
        
        // Handle transaction_hash.txt file
        if (fileName.includes('transaction_hash.txt')) {
          transactionHash = content.trim();
          console.log(`Found transaction hash: ${transactionHash}`);
        }
        
        // Handle proof.json file
        else if (fileName.includes('proof.json')) {
          try {
            const proofData = JSON.parse(content);
            console.log('Proof data structure:', Object.keys(proofData));
            
            // Extract proof hash from proof data
            if (proofData.proof_entries_part1 && Array.isArray(proofData.proof_entries_part1)) {
              // Use the first entry as the proof hash
              proofHash = proofData.proof_entries_part1[0];
              console.log(`Found proof hash: ${proofHash}`);
            }
            
            // Store the full proof data
            proof = proofData;
            
          } catch (parseError) {
            console.error('Error parsing proof.json:', parseError);
          }
        }
        
        // Handle benchmark.json file for timing info
        else if (fileName.includes('benchmark.json')) {
          try {
            const benchmarkData = JSON.parse(content);
            if (benchmarkData.timestamp) {
              // Convert timestamp to prove time format
              const timestamp = new Date(benchmarkData.timestamp);
              const duration = Date.now() - timestamp.getTime();
              const minutes = Math.floor(duration / 60000);
              const seconds = Math.floor((duration % 60000) / 1000);
              proveTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:00`;
              console.log(`Found prove time: ${proveTime}`);
            }
          } catch (parseError) {
            console.error('Error parsing benchmark.json:', parseError);
          }
        }
        
        // Handle other JSON files that might contain proof data
        else if (fileName.endsWith('.json')) {
          try {
            const jsonData = JSON.parse(content);
            
            // Look for proof hash in various formats
            if (jsonData.hash || jsonData.proofHash || jsonData.proof_id) {
              proofHash = jsonData.hash || jsonData.proofHash || jsonData.proof_id;
              console.log(`Found proof hash in ${fileName}: ${proofHash}`);
            }
            
            // Look for transaction hash
            if (jsonData.txHash || jsonData.transactionHash || jsonData.tx) {
              transactionHash = jsonData.txHash || jsonData.transactionHash || jsonData.tx;
              console.log(`Found transaction hash in ${fileName}: ${transactionHash}`);
            }
            
            // Look for prove time
            if (jsonData.proveTime || jsonData.time || jsonData.duration) {
              proveTime = jsonData.proveTime || jsonData.time || jsonData.duration;
              console.log(`Found prove time in ${fileName}: ${proveTime}`);
            }
            
            // Look for public signals
            if (jsonData.publicSignals || jsonData.public_signals) {
              publicSignals = jsonData.publicSignals || jsonData.public_signals;
            }
            
          } catch (parseError) {
            // If not JSON, try to extract hash from text content
            const hashMatch = content.match(/0x[a-fA-F0-9]{64}/);
            if (hashMatch) {
              if (fileName.includes('transaction') || fileName.includes('tx')) {
                transactionHash = hashMatch[0];
                console.log(`Found transaction hash in ${fileName}: ${transactionHash}`);
              } else {
                proofHash = hashMatch[0];
                console.log(`Found proof hash in ${fileName}: ${proofHash}`);
              }
            }
          }
        }
      }
    }
    
    console.log('Final extracted data:', {
      proofHash,
      transactionHash,
      proveTime,
      hasProof: !!proof
    });
    
    return {
      hash: proofHash,
      transactionHash,
      proveTime,
      status: '0', // Always show pending status initially
      proofData: {
        publicSignals,
        proof,
        transactionHash,
      }
    };
    
  } catch (error) {
    console.error('Error processing zip file:', error);
    return {
      status: '0',
      hash: '',
      proveTime: '00:00:00',
    };
  }
}

// Fetch form submissions from Google Forms
async function fetchFormSubmissions(): Promise<ProofSubmission[]> {
  try {
    // Use the Google Forms integration
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/google-forms`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('Error from Google Forms API:', data.error);
      return [];
    }
    
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
        transactionHash: processedData.transactionHash,
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
