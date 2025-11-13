import React, { useState } from "react";
import { useApp } from "../../../context/Context";

const BulkUploadInterface = ({ onBack, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { currentUser } = useApp();

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
    ];

    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert(
        "Please upload only Excel (.xlsx, .xls) or Word (.docx, .doc) files."
      );
      return;
    }

    setUploading(true);
    try {
      // Simulate file processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newFiles = files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      onSuccess(
        `Successfully uploaded ${files.length} file(s) for bulk processing.`
      );
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.includes("sheet") || type.includes("excel")) {
      return (
        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
          <span className="text-xs font-bold text-green-700">XLS</span>
        </div>
      );
    } else if (type.includes("word")) {
      return (
        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
          <span className="text-xs font-bold text-blue-700">DOC</span>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
        <svg
          className="w-4 h-4 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-2xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back</span>
        </button>
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">
          Upload File
        </h3>
      </div>

      <p className="text-sm text-gray-600">Add files of your product</p>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          uploading
            ? "border-gray-200 bg-gray-50"
            : "border-gray-300 hover:border-blue-400 cursor-pointer"
        }`}
        onClick={() =>
          !uploading && document.getElementById("bulk-file-input").click()
        }
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <div className="text-gray-700 font-medium mb-2">
          {uploading
            ? "Processing files..."
            : "Browse and choose the file you want to upload from your computer"}
        </div>

        {!uploading && (
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Upload
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        id="bulk-file-input"
        type="file"
        multiple
        accept=".xlsx,.xls,.docx,.doc"
        onChange={handleFileUpload}
        className="hidden"
        disabled={uploading}
      />

      {/* Upload Instructions */}
      <UploadInstructions />

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <UploadedFilesList
          files={uploadedFiles}
          onRemoveFile={removeFile}
          formatFileSize={formatFileSize}
          getFileIcon={getFileIcon}
        />
      )}
    </div>
  );
};

const UploadInstructions = () => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-base md:text-lg font-medium text-gray-900">
        Upload Instructions
      </h4>
      <button className="text-[#800000] text-sm hover:text-blue-600 flex items-center space-x-1">
        <span>View</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>

    <ul className="space-y-3 text-sm md:text-base text-gray-600">
      {[
        "Use our template file as the basis for bulk upload",
        "Supported formats: Excel (.xlsx, .xls) and Word (.docx, .doc)",
        "Maximum file size: 5MB per file",
        "Ensure all required fields are filled in the template",
        "Include product images URLs in the designated columns",
        "Review data before uploading to avoid errors",
      ].map((instruction, index) => (
        <li key={index} className="flex items-start space-x-2">
          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
          <span>{instruction}</span>
        </li>
      ))}
    </ul>
  </div>
);

const UploadedFilesList = ({
  files,
  onRemoveFile,
  formatFileSize,
  getFileIcon,
}) => (
  <div className="mt-6">
    <h4 className="text-sm font-medium text-gray-700 mb-3">
      Uploaded Files ({files.length})
    </h4>
    <div className="space-y-3">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
        >
          {getFileIcon(file.type)}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </div>
            <div className="text-xs text-gray-500">
              {formatFileSize(file.size)} • Uploaded{" "}
              {new Date(file.uploadedAt).toLocaleTimeString()}
            </div>
          </div>
          <button
            onClick={() => onRemoveFile(index)}
            className="text-red-500 hover:text-red-700 p-1"
            title="Remove file"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default BulkUploadInterface;
