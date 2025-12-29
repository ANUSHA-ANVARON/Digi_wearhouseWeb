// BulkUploadPage.jsx - PRODUCTION VERSION
import React, { useState, useRef } from 'react';
import { ArrowLeft, UploadCloud, CheckCircle, XCircle, AlertCircle, Download, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import firebaseService from '../../SERVICES/firebaseService';
import ExcelJS from 'exceljs';
import { uploadToCloudinary } from '../utilities/cloudinary';
import { useApp  } from '../context/Context'; // Adjust path to your auth context

const BulkUploadPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp(); // Get current user from your auth context
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [currentStep, setCurrentStep] = useState('upload'); // upload, preview, processing, complete




  // Generate Excel Template
  const generateTemplate = () => {
    const template = [
      {
        title: 'Black Banarasi Jacquard Sharara Set',
        description: 'Featuring a black handcrafted kurta in georgette base with nakshi and cutdana work',
        category: 'WOMEN',
        productType: 'Ready to Wear',
        dressType: 'SHARARAS',
        subDressType: 'Silk Sharara Fabric',
        fabric: 'Cotton',
        craft: 'Embroidered',
        price: 63592,
        selectedSizes: 'S,M,L,XL',
        selectedColors: 'black_#000000',
        units_data: 'black_#000000:S=10,M=20,L=30,XL=40',
        imageUrl1: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765349896/sample1.webp',
        imageUrl2: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765349898/sample2.webp',
        imageUrl3: '',
        imageUrl4: '',
        gender: '',
        occasion: 'Wedding,Party',
        pattern: '',
        work: '',
        weave: '',
        premium: 'true',
        linkedBlouseType: '',
        isVirtualTryOnEnabled: 'true',
        status: 'active',
        keywords: 'sharara,wedding,ethnic'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 40 }, // title
      { wch: 60 }, // description
      { wch: 15 }, // category
      { wch: 20 }, // productType
      { wch: 20 }, // dressType
      { wch: 25 }, // subDressType
      { wch: 15 }, // fabric
      { wch: 15 }, // craft
      { wch: 10 }, // price
      { wch: 20 }, // selectedSizes
      { wch: 30 }, // selectedColors
      { wch: 50 }, // units_data
      { wch: 80 }, // imageUrl1
      { wch: 80 }, // imageUrl2
      { wch: 80 }, // imageUrl3
      { wch: 80 }, // imageUrl4
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    
    XLSX.writeFile(wb, 'DVYB_Bulk_Upload_Template.xlsx');
  };

  // Parse Excel File with ExcelJS to support images
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file size (10MB limit for images)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    
    try {
        const workbook = new ExcelJS.Workbook();
        const arrayBuffer = await selectedFile.arrayBuffer();
        await workbook.xlsx.load(arrayBuffer);
        
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
             alert('Excel file is empty');
             return;
        }

        // 1. Extract Images
        const imageMap = {};
        if (worksheet.getImages()) {
          worksheet.getImages().forEach(image => {
            const imgId = image.imageId;
            const img = workbook.model.media.find(m => m.index === imgId);
            
            if (img) {
              const range = image.range;
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
           columnMap[colNumber] = val; 
           if (val.includes('title') || val.includes('name')) {
             titleColumnFound = true;
           }
        });

        if (!titleColumnFound) {
           alert("Error: No 'Title' or 'Name' column found. Please check header row.");
           return;
        }

        // 3. Process Rows
        const parsed = [];
        const totalRows = worksheet.rowCount;
        
        // Start from row 2
        for (let rowIdx = 2; rowIdx <= totalRows; rowIdx++) {
           const row = worksheet.getRow(rowIdx);
           if (!row.hasValues) continue;

           // Parse row data to object
           const rowData = {};
           row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
               const header = columnMap[colIdx];
               if (!header) return;
                
               let cellValue = cell.value;
               if (cellValue && typeof cellValue === 'object') {
                   if (cellValue.text) cellValue = cellValue.text;
                   else if (cellValue.richText) cellValue = cellValue.richText.map(t => t.text).join('');
                   else if (cellValue.result) cellValue = cellValue.result;
               }
               rowData[header] = cellValue;
           });

           // Get images for this row
           const rowImageFiles = [];
           Object.keys(columnMap).forEach(colIdxStr => {
                const colIdx = parseInt(colIdxStr);
                const key = `${rowIdx}-${colIdx}`;
                if (imageMap[key]) {
                   const imgData = imageMap[key];
                   const blob = new Blob([imgData.buffer], { type: `image/${imgData.extension}` });
                   const imgFile = new File([blob], `${imgData.name}.${imgData.extension}`, { type: `image/${imgData.extension}` });
                   rowImageFiles.push(imgFile);
                }
           });

           parsed.push({
               rowNumber: rowIdx,
               ...parseProductRow(rowData, rowImageFiles),
               status: 'pending'
           });
        }

        if (parsed.length === 0) {
             alert('No valid product rows found.');
             return;
        }

        setParsedData(parsed);
        setCurrentStep('preview');

    } catch (error) {
        console.error('Parse error:', error);
        alert('Error parsing Excel: ' + error.message);
    }
  };

  // Parse individual product row
  const parseProductRow = (row, imageFiles = []) => {
    // Helper helpers
    const getVal = (keys) => {
        for (const k of keys) {
            const found = Object.keys(row).find(key => key.includes(k));
            if (found) return row[found];
        }
        return '';
    };

    const title = getVal(['title', 'name']);
    const description = getVal(['desc']);
    const price = parseFloat(getVal(['price'])) || 0;
    
    // Parse units
    const unitsData = getVal(['units', 'stock']) || '';
    const parseUnits = (unitsStr) => {
      if (!unitsStr || typeof unitsStr !== 'string' || unitsStr.trim() === '') return {};
      const units = {};
      try {
        unitsStr.split('|').forEach(group => {
          const [color, sizeData] = group.split(':');
          if (color && sizeData) {
            const cleanColor = color.trim();
            units[cleanColor] = {};
            sizeData.split(',').forEach(pair => {
              const [size, qty] = pair.split('=');
              if (size && qty) units[cleanColor][size.trim()] = qty.trim();
            });
          }
        });
      } catch (e) { console.error(e); }
      return units;
    };

    // Parse arrays
    const parseArray = (val) => val ? String(val).split(',').map(s => s.trim()).filter(Boolean) : [];

    // Combine excel-link images + embedded images
    let imageUrls = [];
    Object.keys(row).forEach(k => {
        if (k.includes('image') || k.includes('photo')) {
            const val = row[k];
            if (val && (String(val).startsWith('http') || String(val).startsWith('www'))) {
                imageUrls.push(val);
            }
        }
    });

    return {
      title: title,
      name: title,
      description: description,
      category: (getVal(['category']) || 'WOMEN').toUpperCase(),
      productType: getVal(['producttype', 'type']) || 'Ready to Wear',
      dressType: getVal(['dresstype']) || '',
      subDressType: getVal(['subdresstype']) || '',
      fabric: getVal(['fabric']) || '',
      craft: getVal(['craft']) || '',
      premium: String(getVal(['premium'])).toLowerCase() === 'true',
      linkedBlouseType: getVal(['linkedblousetype']) || '',
      isVirtualTryOnEnabled: String(getVal(['virtualtryon'])).toLowerCase() === 'true',
      price: price,
      selectedSizes: parseArray(getVal(['size'])),
      selectedColors: parseArray(getVal(['color'])),
      units: parseUnits(unitsData),
      imageUrls: imageUrls,
      imageFiles: imageFiles, // Store raw files
      slug: firebaseService.slugify(title || 'untitled-product'),
      status: 'active',
      isPublished: true,
      seo: {
        title: title,
        metaDescription: String(description).slice(0, 160),
        keywords: parseArray(getVal(['keyword'])),
        canonicalUrl: ''
      },
      attributes: {
        gender: getVal(['gender']) || '',
        occasion: parseArray(getVal(['occasion'])),
        pattern: getVal(['pattern']) || '',
        work: getVal(['work']) || '',
        weave: getVal(['weave']) || '',
        material: getVal(['material']) || ''
      }
    };
  };

  // Upload all products to Firebase
  const handleBulkUpload = async () => {
  if (!currentUser || !currentUser.uid) {
    alert('You must be logged in to upload products');
    return;
  }

  setUploading(true);
  setCurrentStep('processing');

  const userId = currentUser.uid;
  const results = [];

  for (let i = 0; i < parsedData.length; i++) {
    const product = parsedData[i];

    try {
      let finalImageUrls = [...product.imageUrls];

      // Upload embedded images to Cloudinary
      if (product.imageFiles && product.imageFiles.length > 0) {
          try {
              const cloudinaryUrls = [];
              for (const file of product.imageFiles) {
                  const url = await uploadToCloudinary(file);
                  cloudinaryUrls.push(url);
                  console.log(`✅ Uploaded embedded image to Cloudinary:`, url);
              }
              finalImageUrls = [...finalImageUrls, ...cloudinaryUrls];
          } catch (err) {
              console.error(`❌ Failed to upload embedded images for row ${i+1}:`, err);
              throw new Error(`Image upload failed: ${err.message}`);
          }
      }

      const finalProduct = {
        ...product,
        imageUrls: finalImageUrls,
      };
      // Remove temporary file objects
      delete finalProduct.imageFiles; 

      const result = await firebaseService.saveBulkProduct(finalProduct, userId);

      results.push({
        rowNumber: product.rowNumber,
        title: product.title,
        status: 'success',
        productId: result.productId,
        message: 'Uploaded successfully',
      });

      setUploadResults([...results]);
    } catch (error) {
      results.push({
        rowNumber: product.rowNumber,
        title: product.title,
        status: 'error',
        message: error.message,
      });
      setUploadResults([...results]);
    }

    await new Promise((res) => setTimeout(res, 200));
  }

  setUploading(false);
  setCurrentStep('complete');
};








  // Render Steps
  const renderContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-gray-600 mb-4">
              Add Excel file with your products
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UploadCloud className="text-blue-600" size={32} />
                </div>
              </div>

              <p className="text-gray-700 mb-2 font-medium">
                Browse and choose the Excel file
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supported formats: .xlsx, .xls (Max 5MB)
              </p>

              <input
                type="file"
                ref={fileRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                hidden
              />

              <button
                onClick={() => fileRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg"
              >
                Choose File
              </button>

              {file && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
                  <p className="text-sm text-blue-700">
                    📄 Selected: <span className="font-medium">{file.name}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Template Download */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <div className="flex items-start gap-4">
                <Download className="text-purple-600 mt-1 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    📥 First time uploading?
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Download our Excel template with pre-defined columns and sample data. 
                    This ensures your products match the exact format required.
                  </p>
                  <button
                    onClick={generateTemplate}
                    className="bg-white border-2 border-purple-200 text-purple-700 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition shadow-sm"
                  >
                    <Download size={16} className="inline mr-2" />
                    Download Template
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-10 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="text-blue-600" size={20} />
                Upload Instructions
              </h2>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">1.</span>
                  <p><strong>Required Fields:</strong> title, price, category, dressType must be filled</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">2.</span>
                  <p><strong>Sizes:</strong> Comma-separated (e.g., S,M,L,XL or XS,M,L,XL,XXL)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">3.</span>
                  <p><strong>Colors:</strong> Format: colorname_hexcode (e.g., black_#000000, red_#FF0000)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">4.</span>
                  <p><strong>Stock (units_data):</strong> Format: color:size=qty|color:size=qty<br/>
                  <span className="text-gray-500 text-xs ml-5">Example: black_#000000:S=10,M=20,L=30|red_#FF0000:S=15,M=25</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">5.</span>
                  <p><strong>Images:</strong> Use Cloudinary URLs in imageUrl1, imageUrl2, imageUrl3, imageUrl4</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">6.</span>
                  <p><strong>Boolean Fields:</strong> Use "true" or "false" for premium, isVirtualTryOnEnabled</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <p className="text-green-800 font-medium">
                ✓ {parsedData.length} products parsed successfully from Excel
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Row</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Sizes</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Colors</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Images</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((product, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{product.rowNumber}</td>
                        <td className="px-4 py-3 font-medium max-w-xs truncate">{product.title}</td>
                        <td className="px-4 py-3">
                          <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold">₹{product.price.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                            {product.selectedSizes.length} sizes
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {product.selectedColors.length} colors
                          </span>
                        </td>
                       <td className="px-4 py-3 min-w-[200px]">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {/* Display Extracted Images */}
                            {product.imageFiles && product.imageFiles.map((file, i) => (
                              <div key={`file-${i}`} className="relative group"> 
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt="preview" 
                                  className="w-12 h-12 object-cover rounded border border-gray-200" 
                                />
                                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1 rounded-full">New</span>
                              </div>
                            ))}
                            {/* Display Link Images */}
                            {product.imageUrls && product.imageUrls.map((url, i) => (
                               <img 
                                 key={`url-${i}`} 
                                 src={url} 
                                 alt="link preview" 
                                 className="w-12 h-12 object-cover rounded border border-blue-200" 
                                 title={url}
                               />
                            ))}
                          </div>

                       </td>

                        <td className="px-4 py-3">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                            {Object.keys(product.units).length} variants
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => {
                  setCurrentStep('upload');
                  setFile(null);
                  setParsedData([]);
                }}
                className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Upload Different File
              </button>

              <button
                onClick={handleBulkUpload}
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UploadCloud size={20} />
                Upload {parsedData.length} Products to Firebase
              </button>
            </div>
          </div>
        );

      case 'processing':
        const progress = uploadResults.length;
        const total = parsedData.length;
        const percentage = Math.round((progress / total) * 100);

        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Uploading Products...
                </h3>
                <p className="text-gray-600 text-lg font-medium">
                  {progress} of {total} completed ({percentage}%)
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {uploadResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg flex items-center gap-3 ${
                      result.status === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {result.status === 'success' ? (
                      <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                    ) : (
                      <XCircle className="text-red-600 flex-shrink-0" size={20} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        Row {result.rowNumber}: {result.title}
                      </p>
                      <p className="text-xs text-gray-600">{result.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'complete':
        const successCount = uploadResults.filter(r => r.status === 'success').length;
        const errorCount = uploadResults.filter(r => r.status === 'error').length;

        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-lg">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={40} />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Upload Complete!
              </h3>
              <p className="text-gray-600 mb-6">
                {successCount} products uploaded successfully to bulkOrders collection
                {errorCount > 0 && `, ${errorCount} failed`}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-3xl font-bold text-green-600">{successCount}</p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
                {errorCount > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-3xl font-bold text-red-600">{errorCount}</p>
                    <p className="text-sm text-gray-600">Failed</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => {
                    setCurrentStep('upload');
                    setFile(null);
                    setParsedData([]);
                    setUploadResults([]);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg"
                >
                  Upload More Products
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg"
                >
                  View All Products
                </button>
              </div>
            </div>

            {/* Detailed Results */}
            {errorCount > 0 && (
              <div className="mt-6 bg-white border border-red-200 rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <XCircle className="text-red-600" size={20} />
                  Failed Uploads ({errorCount}):
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {uploadResults
                    .filter(r => r.status === 'error')
                    .map((result, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-sm text-gray-900">
                          Row {result.rowNumber}: {result.title}
                        </p>
                        <p className="text-xs text-red-600 mt-1">{result.message}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bulk Upload Products</h1>
            <p className="text-sm text-gray-600">Upload multiple products via Excel file</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="hidden md:flex items-center gap-2">
          {['upload', 'preview', 'processing', 'complete'].map((step, index) => {
            const stepIndex = ['upload', 'preview', 'processing', 'complete'].indexOf(currentStep);
            const isActive = currentStep === step;
            const isCompleted = stepIndex > index;

            return (
              <div
                key={step}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default BulkUploadPage;