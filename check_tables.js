
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmbpdrqpxazxwmdagsio.supabase.co';
const supabaseKey = 'sb_publishable_IKmA8HxZQG9t7uqpRPNfTA_AtUWgbqj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
    console.log("Creating bucket 'course-content'...");
    const { data, error } = await supabase.storage.createBucket('course-content', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf', 'video/mp4', 'video/quicktime', 'image/png', 'image/jpeg']
    });
    
    if (error) {
        console.error("Error creating bucket:", error.message);
    } else {
        console.log("Bucket created successfully:", data);
    }
}

createBucket();
