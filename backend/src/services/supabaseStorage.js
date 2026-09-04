let createClient = null;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  try {
    const rootPath = require('path').resolve(__dirname, '../../../../node_modules/@supabase/supabase-js');
    createClient = require(rootPath).createClient;
  } catch (err) {
    // Supabase module optional when running in local storage mode
  }
}
const path = require('path');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'lisan-media';

let supabase = null;
if (supabaseUrl && supabaseKey && createClient) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Checks if Supabase Storage client is initialized and configured
 */
function isSupabaseConfigured() {
  return Boolean(supabase);
}

/**
 * Upload a file buffer to Supabase Storage (or fallback to local disk if dev & unconfigured)
 * @param {Object} file - Express/Multer file object with buffer
 * @param {string} folder - Destination subfolder (e.g. 'gallery', 'news', 'pengurus', 'hero', 'proker')
 * @returns {Promise<string>} Public URL or relative path of uploaded file
 */
async function uploadToStorage(file, folder = 'misc') {
  if (!file || !file.buffer) {
    throw new Error('File tidak valid atau tidak memiliki buffer');
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').slice(0, 40);
  const uniqueName = `${cleanBase}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
  const filePath = `${folder}/${uniqueName}`;

  if (supabase) {
    // Upload buffer to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      throw new Error(`Gagal upload ke Supabase Storage: ${error.message}. Pastikan bucket "${bucketName}" sudah dibuat dan diset Public di Supabase.`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  // If in Vercel / serverless environment and Supabase is not configured, throw error
  if (process.env.VERCEL) {
    throw new Error('SUPABASE_KEY belum diatur di Vercel Environment Variables. Sistem file Vercel bersifat read-only.');
  }

  // Local development fallback: write buffer to backend/uploads folder
  const targetDir = path.join(__dirname, '..', '..', 'uploads', folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const diskPath = path.join(targetDir, uniqueName);
  fs.writeFileSync(diskPath, file.buffer);

  return `/uploads/${folder}/${uniqueName}`;
}

/**
 * Delete a file from Supabase Storage or local disk
 * @param {string} fileUrl - Public URL or local path
 */
async function deleteFromStorage(fileUrl) {
  if (!fileUrl) return;

  if (supabase && fileUrl.includes(bucketName)) {
    try {
      // Extract path after bucket name
      const parts = fileUrl.split(`${bucketName}/`);
      if (parts.length > 1) {
        const relativePath = decodeURIComponent(parts[1].split('?')[0]);
        await supabase.storage.from(bucketName).remove([relativePath]);
      }
    } catch (err) {
      console.warn('Gagal menghapus file dari Supabase Storage:', err.message);
    }
    return;
  }

  // Local fallback
  if (fileUrl.startsWith('/uploads/')) {
    try {
      const localPath = path.join(__dirname, '..', '..', fileUrl);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (err) {
      console.warn('Gagal menghapus file lokal:', err.message);
    }
  }
}

module.exports = {
  uploadToStorage,
  deleteFromStorage,
  isSupabaseConfigured,
  bucketName
};
