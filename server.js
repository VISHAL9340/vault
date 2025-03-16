import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import pinataSDK from '@pinata/sdk';
import authRoutes from './server/auth.js';

// ✅ Load environment variables
dotenv.config();

// ✅ Validate Environment Variables
const requiredEnvVars = ['PINATA_API_KEY', 'PINATA_SECRET_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// ✅ Setup Express
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Initialize Pinata SDK
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

// ✅ Check Pinata Authentication
async function checkPinataAuth() {
  try {
    const response = await pinata.testAuthentication();
    console.log('✅ Successfully connected to Pinata');
  } catch (error) {
    console.error('❌ Pinata authentication failed:', error.message);
    process.exit(1);
  }
}
checkPinataAuth(); // Call this function to check authentication

// ✅ Setup file upload directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ✅ Routes
app.use('/auth', authRoutes); // Authentication Routes

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    pinataConnected: true
  });
});

// ✅ Get all uploaded files
app.get('/files', async (req, res) => {
  try {
    const files = await fs.promises.readdir(uploadDir);
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching files', error: error.message });
  }
});

// ✅ File Upload Endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    console.log("📤 Uploading file to Pinata:", req.file.originalname);

    const readableStreamForFile = fs.createReadStream(req.file.path);
    const result = await pinata.pinFileToIPFS(readableStreamForFile, {
      pinataMetadata: {
        name: req.file.originalname,
        keyvalues: {
          uploadDate: new Date().toISOString(),
          fileType: req.file.mimetype
        }
      }
    });

    console.log("✅ File uploaded successfully! CID:", result.IpfsHash);

    // Delete the uploaded file after storing on Pinata
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('⚠️ Error removing temporary file:', err);
    });

    return res.json({
      success: true,
      ipfsHash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    if (req.file) fs.unlink(req.file.path, (err) => console.error(err));

    return res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🩺 Health check available at http://localhost:${PORT}/health`);
});
