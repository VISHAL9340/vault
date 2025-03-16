import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileCheck } from 'lucide-react';

interface DocumentUploadProps {
  onUpload: (file: File) => void;
}

export function DocumentUpload({ onUpload }: DocumentUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-lg text-blue-500">Drop your document here...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-600">Drag & drop your document here</p>
            <p className="text-sm text-gray-500 mt-2">or click to select a file</p>
            <p className="text-xs text-gray-400 mt-2">Supported formats: JPG, PNG, PDF</p>
          </div>
        )}
      </div>

      {acceptedFiles.length > 0 && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center">
          <FileCheck className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-700">{acceptedFiles[0].name} ready for upload</span>
        </div>
      )}
    </div>
  );
}