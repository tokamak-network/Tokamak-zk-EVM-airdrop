#!/usr/bin/env node

const https = require('https');

// Your Google Form details
const FORM_ID = '1FAIpQLScCb2ntheg6SP7Eu8XLTRtJhm78hDVJkO5p_aT3o5rrgYFlaQ';
const API_KEY = 'AIzaSyCTv6IS8ypoZfcO8T5NfBYBp5GeAFAkG2Q';

// Test Google Forms API
async function testGoogleFormsAPI() {
  console.log('🔍 Testing Google Forms API...\n');
  
  // Test 1: Get form structure
  console.log('1. Fetching form structure...');
  try {
    const formData = await fetchFormStructure();
    console.log('✅ Form structure fetched successfully');
    console.log('Form Title:', formData.title);
    console.log('Form Description:', formData.description);
    console.log('\n📋 Form Fields:');
    
    formData.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   Type: ${item.questionItem?.question?.textQuestion?.paragraph ? 'Paragraph' : 
                  item.questionItem?.question?.choiceQuestion ? 'Multiple Choice' :
                  item.questionItem?.question?.fileUploadQuestion ? 'File Upload' :
                  item.questionItem?.question?.textQuestion ? 'Short Answer' : 'Unknown'}`);
      
      if (item.questionItem?.question?.fileUploadQuestion) {
        console.log(`   File Types: ${item.questionItem.question.fileUploadQuestion.types?.join(', ') || 'Any'}`);
      }
      
      if (item.questionItem?.question?.choiceQuestion?.options) {
        console.log(`   Options: ${item.questionItem.question.choiceQuestion.options.map(opt => opt.value).join(', ')}`);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error fetching form structure:', error.message);
  }
  
  // Test 2: Get form responses
  console.log('\n2. Fetching form responses...');
  try {
    const responses = await fetchFormResponses();
    console.log('✅ Form responses fetched successfully');
    console.log(`Found ${responses.length} responses\n`);
    
    if (responses.length > 0) {
      console.log('📊 Sample response structure:');
      const sampleResponse = responses[0];
      console.log('Response ID:', sampleResponse.responseId);
      console.log('Create Time:', sampleResponse.createTime);
      console.log('Last Submit Time:', sampleResponse.lastSubmittedTime);
      console.log('\nAnswers:');
      
      sampleResponse.answers.forEach((answer, index) => {
        console.log(`${index + 1}. Question ID: ${answer.questionId}`);
        if (answer.textAnswers) {
          console.log(`   Text Answer: ${answer.textAnswers.answers.map(a => a.value).join(', ')}`);
        }
        if (answer.fileUploadAnswers) {
          console.log(`   File Upload: ${answer.fileUploadAnswers.answers.map(a => a.fileId).join(', ')}`);
        }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching form responses:', error.message);
  }
}

// Fetch form structure
function fetchFormStructure() {
  return new Promise((resolve, reject) => {
    const url = `https://forms.googleapis.com/v1/forms/${FORM_ID}?key=${API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.error) {
            reject(new Error(jsonData.error.message));
          } else {
            resolve(jsonData);
          }
        } catch (error) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Fetch form responses
function fetchFormResponses() {
  return new Promise((resolve, reject) => {
    const url = `https://forms.googleapis.com/v1/forms/${FORM_ID}/responses?key=${API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.error) {
            reject(new Error(jsonData.error.message));
          } else {
            resolve(jsonData.responses || []);
          }
        } catch (error) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Run the test
testGoogleFormsAPI().catch(console.error);
