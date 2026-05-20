import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = 'https://zutdbxtzwaktrrfjtetg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dGRieHR6d2FrdHJyZmp0ZXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDI2NjIsImV4cCI6MjA5MzIxODY2Mn0.MS6O5WRyy2dLlJi3AGD7uzUiIcGfqNvjI6MZEw_HnKo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log("Testing Supabase connection and upload...");
  
  // Create a dummy file
  const fileContent = "test content";
  const fileName = `test_${Date.now()}.txt`;
  
  const { data, error } = await supabase.storage
    .from('citywatch-images')
    .upload(fileName, fileContent, {
      contentType: 'text/plain'
    });
    
  if (error) {
    console.error("Upload Error:", error);
    if (error.message.includes('row-level security')) {
      console.log("=> RLS POLICY ERROR: You need to allow INSERTs for the bucket.");
    } else if (error.message.includes('Bucket not found')) {
      console.log("=> BUCKET ERROR: The bucket 'citywatch-images' does not exist.");
    }
  } else {
    console.log("Upload Success! Data:", data);
  }
}

testUpload();
