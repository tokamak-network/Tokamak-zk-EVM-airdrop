#!/usr/bin/env node

const https = require('https');

// Your Google Form details
const FORM_ID = '1FAIpQLScCb2ntheg6SP7Eu8XLTRtJhm78hDVJkO5p_aT3o5rrgYFlaQ';
const API_KEY = 'AIzaSyCTv6IS8ypoZfcO8T5NfBYBp5GeAFAkG2Q';

// Test Google Sheets API (easier than Forms API)
async function testGoogleSheetsAPI() {
  console.log('🔍 Testing Google Sheets API approach...\n');
  
  // First, let's try to access the form directly to see if it's public
  console.log('1. Checking if form is publicly accessible...');
  try {
    const formData = await fetchFormPublicly();
    console.log('✅ Form is publicly accessible');
    console.log('Form Title:', formData.title);
    console.log('Form Description:', formData.description);
    
    // Look for wallet address field
    const walletField = findWalletAddressField(formData);
    if (walletField) {
      console.log('\n🎯 Found wallet address field:');
      console.log('Field Name:', walletField.title);
      console.log('Field Type:', walletField.type);
    } else {
      console.log('\n⚠️  Could not identify wallet address field automatically');
    }
    
    // Look for file upload field
    const fileField = findFileUploadField(formData);
    if (fileField) {
      console.log('\n📁 Found file upload field:');
      console.log('Field Name:', fileField.title);
      console.log('Field Type:', fileField.type);
    } else {
      console.log('\n⚠️  Could not identify file upload field automatically');
    }
    
  } catch (error) {
    console.error('❌ Error accessing form:', error.message);
  }
  
  // Alternative: Check if there's a connected Google Sheet
  console.log('\n2. Checking for connected Google Sheet...');
  try {
    // This would require the form to have responses connected to a sheet
    // We'll need to find the sheet ID from the form
    console.log('To get form responses, we need to:');
    console.log('1. Go to your Google Form');
    console.log('2. Click on "Responses" tab');
    console.log('3. Click on the Google Sheets icon to create a linked sheet');
    console.log('4. Get the sheet ID from the URL');
    console.log('5. Use Google Sheets API to read the data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Fetch form data publicly (without authentication)
function fetchFormPublicly() {
  return new Promise((resolve, reject) => {
    const url = `https://docs.google.com/forms/d/e/${FORM_ID}/viewform`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Parse the HTML to extract form information
          const formInfo = parseFormHTML(data);
          resolve(formInfo);
        } catch (error) {
          reject(new Error('Failed to parse form HTML'));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Parse HTML to extract form information
function parseFormHTML(html) {
  // This is a simplified parser - in reality, you'd need a proper HTML parser
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : 'Unknown Form';
  
  // Look for form fields in the HTML
  const fields = [];
  
  // Look for input fields
  const inputMatches = html.match(/<input[^>]*>/gi) || [];
  inputMatches.forEach(input => {
    const nameMatch = input.match(/name="([^"]+)"/i);
    const typeMatch = input.match(/type="([^"]+)"/i);
    const placeholderMatch = input.match(/placeholder="([^"]+)"/i);
    
    if (nameMatch) {
      fields.push({
        name: nameMatch[1],
        type: typeMatch ? typeMatch[1] : 'text',
        placeholder: placeholderMatch ? placeholderMatch[1] : '',
        title: placeholderMatch ? placeholderMatch[1] : nameMatch[1]
      });
    }
  });
  
  // Look for textarea fields
  const textareaMatches = html.match(/<textarea[^>]*>/gi) || [];
  textareaMatches.forEach(textarea => {
    const nameMatch = textarea.match(/name="([^"]+)"/i);
    const placeholderMatch = textarea.match(/placeholder="([^"]+)"/i);
    
    if (nameMatch) {
      fields.push({
        name: nameMatch[1],
        type: 'textarea',
        placeholder: placeholderMatch ? placeholderMatch[1] : '',
        title: placeholderMatch ? placeholderMatch[1] : nameMatch[1]
      });
    }
  });
  
  return {
    title,
    description: 'Form description not available in public view',
    fields
  };
}

// Find wallet address field
function findWalletAddressField(formData) {
  const walletKeywords = ['wallet', 'address', 'ethereum', 'eth', '0x'];
  
  for (const field of formData.fields) {
    const fieldText = (field.title + ' ' + field.placeholder + ' ' + field.name).toLowerCase();
    if (walletKeywords.some(keyword => fieldText.includes(keyword))) {
      return field;
    }
  }
  
  return null;
}

// Find file upload field
function findFileUploadField(formData) {
  for (const field of formData.fields) {
    if (field.type === 'file' || field.name.includes('file') || field.title.toLowerCase().includes('file')) {
      return field;
    }
  }
  
  return null;
}

// Run the test
testGoogleSheetsAPI().catch(console.error);
