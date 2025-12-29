import React, { useState } from "react";
import { useApp } from "../../../context/Context";
import ExcelJS from "exceljs";
import firebaseService from "../../../../SERVICES/firebaseService";

const BulkUploadInterface = ({ onBack, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { currentUser } = useApp();

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert("Please upload only Excel (.xlsx, .xls) files.");
      return;
    }

    setUploading(true);
    setUploadProgress("Starting processing...");

    try {
      // Process each file
      for (const file of files) {
        setUploadProgress(`Processing ${file.name}...`);
        
        const productsToUpload = [];
        const workbook = new ExcelJS.Workbook();
        const arrayBuffer = await file.arrayBuffer();
        await workbook.xlsx.load(arrayBuffer);
        
        const worksheet = workbook.worksheets[0];
        
        // 1. Extract Images
        const imageMap = {};
        if (worksheet.getImages()) {
          worksheet.getImages().forEach(image => {
            const imgId = image.imageId;
            const img = workbook.model.media.find(m => m.index === imgId);
            
            if (img) {
              const range = image.range;
              // ExcelJS uses 0-based index for range in some versions, but cells are 1-based.
              // Let's standardise on 1-based row/col for our map
              const row = (range.tl.nativeRow || range.tl.row) + 1; 
              const col = (range.tl.nativeCol || range.tl.col) + 1;
              const key = `${row}-${col}`;
              imageMap[key] = {
                buffer: img.buffer,
                extension: img.extension || 'png',
                name: img.name || `image_${row}_${col}`
              };
            }
          });
        }

        // 2. Map Headers
        const headerRow = worksheet.getRow(1);
        const columnMap = {};
        let titleColumnFound = false;
        
        headerRow.eachCell((cell, colNumber) => {
           const val = cell.value ? cell.value.toString().toLowerCase().trim() : '';
           columnMap[colNumber] = val; // e.g., 1: "title", 2: "price"
           if (val.includes('title') || val.includes('name')) {
             titleColumnFound = true;
           }
        });

        if (!titleColumnFound) {
          alert("Error: No 'Title' or 'Name' column found in the first row. Please ensure your Excel file has a header row with a 'Title' or 'Name' column.");
          setUploading(false);
          setUploadProgress("");
          e.target.value = "";
          return;
        }

        // 3. Process Rows
        const totalRows = worksheet.rowCount;
        // Start from row 2
        for (let rowIdx = 2; rowIdx <= totalRows; rowIdx++) {
           const row = worksheet.getRow(rowIdx);
           if (!row.hasValues) continue;

           const productData = {
              title: '',
              description: '',
              price: 0,
              imageUrls: [],
              // Default values
              category: 'WOMEN',
              productType: 'Ready to Wear',
              dressType: 'Saree',
              status: 'active',
              isPublished: true, 
           };

           // Extract data from cells
           row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
              const header = columnMap[colIdx];
              if (!header) return;

              let cellValue = cell.value;
              // Handle rich text
              if (cellValue && typeof cellValue === 'object') {
                 if (cellValue.text) cellValue = cellValue.text;
                 else if (cellValue.richText) cellValue = cellValue.richText.map(t => t.text).join('');
                 else if (cellValue.result) cellValue = cellValue.result;
                 else cellValue = String(cellValue);
              }
              cellValue = cellValue ? String(cellValue).trim() : '';

              // Assign to product fields based on header mapping (fuzzy match)
              if (header.includes('title') || header.includes('name')) productData.title = cellValue;
              else if (header.includes('desc')) productData.description = cellValue;
              else if (header.includes('price')) productData.price = cellValue;
              else if (header.includes('category')) productData.category = cellValue;
              else if (header.includes('type')) productData.productType = cellValue;
              else if (header.includes('fabric')) productData.fabric = cellValue;
              else if (header.includes('color')) productData.selectedColors = cellValue.split(',').map(c => c.trim());
              else if (header.includes('size')) productData.selectedSizes = cellValue.split(',').map(s => s.trim());
              else if (header.includes('design')) productData.designType = cellValue;
              else if (header.includes('material')) productData.materialType = cellValue;
              else if (header.includes('style')) productData.style = cellValue;
              else if (header.includes('occasion')) productData.occasion = cellValue.split(',').map(s => s.trim());
              
              // Handle Image URLs (links)
               if (header.includes('image') || header.includes('photo')) {
                   if (cellValue && (cellValue.startsWith('http') || cellValue.startsWith('www'))) {
                        productData.imageUrls.push(cellValue);
                   }
               }
           });

           // 4. Check for Embedded Images in this row
           // We iterate all columns to check if an image is anchoring here
            Object.keys(columnMap).forEach(colIdxStr => {
               const colIdx = parseInt(colIdxStr);
               const key = `${rowIdx}-${colIdx}`;
               if (imageMap[key]) {
                  const imgData = imageMap[key];
                  // Convert ArrayBuffer to File
                  const blob = new Blob([imgData.buffer], { type: `image/${imgData.extension}` });
                  const imgFile = new File([blob], `${imgData.name}.${imgData.extension}`, { type: `image/${imgData.extension}` });
                  
                  // Store file locally to upload later
                  if (!productData.imageFiles) productData.imageFiles = [];
                  productData.imageFiles.push(imgFile);
               }
           });
           
           if (productData.title) { // Minimal validation
              productsToUpload.push(productData);
           }
        }

        // 5. Upload Images to Firebase and Save Products
        setUploadProgress(`Found ${productsToUpload.length} products. Uploading images...`);
        
        const productsWithUploadedImages = [];
        
        for (let i = 0; i < productsToUpload.length; i++) {
            const product = productsToUpload[i];
            setUploadProgress(`Uploading images for product ${i + 1}/${productsToUpload.length}: ${product.title}`);
            
            // Upload images if any
            if (product.imageFiles && product.imageFiles.length > 0) {
                try {
                    const uploadedUrls = await firebaseService.uploadImages(product.imageFiles);
                    product.imageUrls = [...product.imageUrls, ...uploadedUrls];
                } catch (err) {
                    console.error("Failed to upload images for product", product.title, err);
                }
            }
             // Clean up temporary imageFiles
             const { imageFiles, ...productToSave } = product;
            productsWithUploadedImages.push(productToSave);
        }

        // 6. Save Bulk Data
        setUploadProgress(`Saving ${productsWithUploadedImages.length} products to database...`);
        const results = await firebaseService.saveBulkProducts(productsWithUploadedImages, currentUser.uid);
        
        const successCount = results.filter(r => r.status === 'success').length;
        setUploadProgress(`Completed! Saved ${successCount} products.`);

        const newFileEntry = {
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            status: 'Success',
            processedCount: successCount
        };
        setUploadedFiles((prev) => [...prev, newFileEntry]);
      }
      
      onSuccess(`Successfully processed files.`);
      
    } catch (error) {
      console.error(error);
      alert(`Processing failed: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress("");
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
            ? "Processing..."
            : "Browse and choose the file you want to upload (Excel only)"}
        </div>
        
        {uploading && (
             <div className="text-sm text-blue-600 mt-2">{uploadProgress}</div>
        )}

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
        accept=".xlsx,.xls"
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
        "Supported formats: Excel (.xlsx, .xls)",
        "Headers must be in the first row (Title, Description, Price, etc.)",
        "Images can be embedded directly in cells OR provided as links",
        "Wait for processing to complete after selecting file"
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
              {file.processedCount !== undefined && (
                   <span className="ml-2 text-green-600 font-medium">({file.processedCount} products)</span>
              )}
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
