import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { DocumentUpload } from './components/DocumentUpload';
import { uploadToIPFS } from './utils/ipfs';

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadToIPFS(file);
      if (url) {
        setIpfsUrl(url);
      }
    } catch (err) {
      setError('Failed to upload to IPFS. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">DecentraID</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure, decentralized identity verification powered by blockchain technology
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload Your Identity Document</h2>
          <DocumentUpload onUpload={handleUpload} />
          
          {isUploading && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700">Uploading document to IPFS...</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {ipfsUrl && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-700">Document uploaded successfully!</p>
              <p className="text-sm text-green-600 mt-2">
                IPFS URL: <a href={ipfsUrl} target="_blank" rel="noopener noreferrer" className="underline">{ipfsUrl}</a>
              </p>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Security Guarantees:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Documents are stored on IPFS for decentralized security
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Document hashes are recorded on the blockchain for tamper protection
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Zero-knowledge proofs ensure your privacy
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;