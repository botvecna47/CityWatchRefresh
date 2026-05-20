import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://zutdbxtzwaktrrfjtetg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('Please provide SUPABASE_SERVICE_KEY environment variable');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const BUCKET_NAME = 'citywatch-images';
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

async function uploadImages() {
    try {
        console.log(`Checking if bucket "${BUCKET_NAME}" exists...`);
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) throw bucketsError;
        
        const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
        if (!bucketExists) {
            console.log(`Creating public bucket "${BUCKET_NAME}"...`);
            const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: true
            });
            if (createError) throw createError;
            console.log(`Bucket "${BUCKET_NAME}" created successfully.`);
        } else {
            console.log(`Bucket "${BUCKET_NAME}" already exists.`);
        }

        console.log(`Reading files from ${UPLOADS_DIR}...`);
        const files = fs.readdirSync(UPLOADS_DIR);
        
        for (const file of files) {
            const filePath = path.join(UPLOADS_DIR, file);
            const stat = fs.statSync(filePath);
            if (!stat.isFile()) continue;

            console.log(`Uploading ${file}...`);
            const fileBuffer = fs.readFileSync(filePath);
            
            // Determine content type
            const ext = path.extname(file).toLowerCase();
            let contentType = 'image/jpeg';
            if (ext === '.png') contentType = 'image/png';
            if (ext === '.webp') contentType = 'image/webp';

            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(file, fileBuffer, {
                    contentType,
                    upsert: true
                });

            if (error) {
                console.error(`Failed to upload ${file}:`, error.message);
            } else {
                console.log(`Successfully uploaded ${file}`);
            }
        }
        
        console.log('All images processed successfully!');
    } catch (err) {
        console.error('Fatal Error:', err);
    }
}

uploadImages();
