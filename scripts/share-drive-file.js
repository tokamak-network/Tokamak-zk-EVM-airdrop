require('dotenv').config({ path: '.env.local' });

async function shareDriveFileInstructions() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const fileId = '1p9q-9bwYDi0r91fvfD7wWm_jlWOPc7c0';
  
  console.log('🔧 Google Drive File Sharing Instructions');
  console.log('=========================================');
  console.log('');
  console.log('The service account cannot access the Google Drive file because it hasn\'t been shared.');
  console.log('');
  console.log('📁 File ID:', fileId);
  console.log('🔑 Service Account Email:', serviceAccountEmail);
  console.log('');
  console.log('📋 TO FIX THIS:');
  console.log('1. Go to Google Drive: https://drive.google.com');
  console.log('2. Find your file (or open the link: https://drive.google.com/open?id=' + fileId + ')');
  console.log('3. Right-click on the file and select "Share"');
  console.log('4. Add this email address with "Viewer" permission:');
  console.log('   📧', serviceAccountEmail);
  console.log('5. Click "Send" or "Share"');
  console.log('');
  console.log('⏰ After sharing, wait 1-2 minutes for the permissions to propagate.');
  console.log('');
  console.log('🧪 Then test again by running:');
  console.log('   curl -s http://localhost:3000/api/proofs | jq \'.data[0]\'');
  console.log('');
}

shareDriveFileInstructions();
