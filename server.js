import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import pinataSDK from '@pinata/sdk';

// Initialize environment variables
dotenv.config();

// Validate environment variables
const requiredEnvVars = ['PINATA_API_KEY', 'PINATA_SECRET_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Setup Express
const app = express();
app.use(cors());

// Setup file upload directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize Pinata
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

// Verify Pinata credentials
try {
  await pinata.testAuthentication();
  console.log('Successfully connected to Pinata');
} catch (error) {
  console.error('Pinata authentication failed:', error.message);
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    pinataConnected: true
  });
});

// File upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file provided' 
      });
    }

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

    // Clean up: remove the temporary file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error removing temporary file:', err);
    });

    return res.json({
      success: true,
      ipfsHash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    });

  } catch (error) {
    console.error('Upload error:', error);

    // Clean up on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error removing temporary file:', err);
      });
    }

    return res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});