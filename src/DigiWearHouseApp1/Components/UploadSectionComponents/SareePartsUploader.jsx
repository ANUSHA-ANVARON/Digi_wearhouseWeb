import React, { useState, useEffect } from "react";
import {
  Upload,
  X,
  CheckCircle,
  Sparkles,
  AlertCircle,
  Download,
} from "lucide-react";
import { uploadToCloudinary } from "../../utilities/cloudinary";
import { useNavigate } from "react-router-dom";

const SareePartsUploader = ({ formData = {}, onChange = () => { } }) => {

  const [uploading, setUploading] = useState(false);
  const [draggedPart, setDraggedPart] = useState(null);
  const [error, setError] = useState(null);
  const [generatingComplete, setGeneratingComplete] = useState(false);
  const navigate = useNavigate();
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const originalFilesRef = React.useRef({});

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null); // { type: 'success'|'error', message }
  const [feedbackTargets, setFeedbackTargets] = useState(['saree-border']);



  const partLabels = {
    'saree-border': {
      name: "Saree Border",
      description: "Borders at pleats edge, pallu bottom, and shoulder",
      icon: "✨",
    },
    'blouse-border': {
      name: "Blouse Border",
      description: "Border below shoulder, almost above elbow",
      icon: "💫",
    },
    'saree-body': {
      name: "Saree Body",
      description: "Main saree fabric pattern",
      icon: "🧵",
    },
    'blouse-body': {
      name: "Blouse Body",
      description: "Main blouse fabric pattern",
      icon: "👚",
    },
    'saree-pallu': {
      name: "Saree Pallu",
      description: "Decorative shoulder drape",
      icon: "🎨",
    },
    'saree-pleats': {
      name: "Saree Pleats",
      description: "Folded front portion",
      icon: "📏",
    },
  };

  // View labels for the 4 generated views
  const viewLabels = {
    front: {
      name: "Front View",
      description: "Standing front pose",
      icon: "👗",
    },
    back: { name: "Back View", description: "Back draping view", icon: "🔄" },
  };


  const sareeParts = {
    'saree-border': formData.sareeParts?.['saree-border'] || { file: null, preview: null, url: null },
    'blouse-border': formData.sareeParts?.['blouse-border'] || { file: null, preview: null, url: null },
    'saree-body': formData.sareeParts?.['saree-body'] || { file: null, preview: null, url: null },
    'blouse-body': formData.sareeParts?.['blouse-body'] || { file: null, preview: null, url: null },
    'saree-pallu': formData.sareeParts?.['saree-pallu'] || { file: null, preview: null, url: null },
    'saree-pleats': formData.sareeParts?.['saree-pleats'] || { file: null, preview: null, url: null },
  };


  useEffect(() => {

    if (formData.hasGeneratedSaree) return;

    if (formData.generatedSareeViews) return;


    const allPartsUploaded = Object.values(sareeParts).every(part => part.file);

    if (
      allPartsUploaded &&
      !formData.generatedSareeViews &&
      !hasGeneratedOnce &&
      !generatingComplete
    ) {
      setHasGeneratedOnce(true);  // prevent re-triggering
      handleAutoGenerateCompleteSaree();
    }
  }, [sareeParts['saree-border'].file,
  sareeParts['blouse-border'].file,
  sareeParts['saree-body'].file,
  sareeParts['blouse-body'].file,
  sareeParts['saree-pallu'].file,
  sareeParts['saree-pleats'].file]);

  const handleDrag = (e, partName) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDraggedPart(partName);
    } else if (e.type === "dragleave") {
      setDraggedPart(null);
    }
  };

  const handleDrop = (e, partName) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedPart(null);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0], partName);
    }
  };

  // const handleFile = async (file, partName) => {
  //   if (!file.type.startsWith("image/")) {
  //     setError(
  //       `Please select a valid image file for ${partLabels[partName].name}`
  //     );
  //     return;
  //   }

  //   setUploading(true);
  //   setError(null);

  //   try {
  //     const previewUrl = URL.createObjectURL(file);
  //     console.log(`Uploading ${partName} to Cloudinary...`);
  //     const cloudinaryUrl = await uploadToCloudinary(file);
  //     console.log(`${partName} uploaded:`, cloudinaryUrl);

  //     const updatedParts = {
  //       ...sareeParts,
  //       [partName]: {
  //         file,
  //         preview: previewUrl,
  //         url: cloudinaryUrl,
  //       },
  //     };

  //     onChange("sareeParts", updatedParts);

  //     const currentImageUrls = formData.imageUrls || [];
  //     const partIndex = Object.keys(partLabels).indexOf(partName);
  //     const newImageUrls = [...currentImageUrls];
  //     newImageUrls[partIndex + 1] = cloudinaryUrl;
  //     onChange("imageUrls", newImageUrls);

  //     console.log(
  //       `Updated imageUrls[${partIndex + 1}] with ${partName}:`,
  //       cloudinaryUrl
  //     );
  //     setError(null);
  //   } catch (err) {
  //     console.error(`Upload failed for ${partName}:`, err);
  //     setError(
  //       `Upload failed for ${partLabels[partName].name}: ${err.message}`
  //     );
  //   } finally {
  //     setUploading(false);
  //   }
  // };


  const handleFile = async (file, partName) => {
    if (!file.type.startsWith("image/")) {
      setError(
        `Please select a valid image file for ${partLabels[partName].name}`
      );
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // ✅ Store original file in ref
      originalFilesRef.current[partName] = file;

      const previewUrl = URL.createObjectURL(file);
      console.log(`Uploading ${partName} to Cloudinary...`);
      const cloudinaryUrl = await uploadToCloudinary(file);
      console.log(`${partName} uploaded:`, cloudinaryUrl);

      const updatedParts = {
        ...sareeParts,
        [partName]: {
          file,
          preview: previewUrl,
          url: cloudinaryUrl,
        },
      };

      onChange("sareeParts", updatedParts);

      const currentImageUrls = formData.imageUrls || [];
      const partIndex = Object.keys(partLabels).indexOf(partName);
      const newImageUrls = [...currentImageUrls];
      newImageUrls[partIndex + 1] = cloudinaryUrl;
      onChange("imageUrls", newImageUrls);

      console.log(
        `Updated imageUrls[${partIndex + 1}] with ${partName}:`,
        cloudinaryUrl
      );
      setError(null);
    } catch (err) {
      console.error(`Upload failed for ${partName}:`, err);
      setError(
        `Upload failed for ${partLabels[partName].name}: ${err.message}`
      );
    } finally {
      setUploading(false);
    }
  };

  // Then in handleAutoGenerateCompleteSaree
  const handleAutoGenerateCompleteSaree = async (userFeedback = "", feedbackTargetsOverride = null) => {
    if (!getAllPartsUploaded()) {
      console.log("Not all parts uploaded yet");
      return;
    }

    setGeneratingComplete(true);
    setError(null);
    console.log("Starting AI saree generation for front and back views...");

    try {
      const formDataToSend = new FormData();

      // Stable session so server can keep consistent memory slots (design + final views).
      // Keep it simple: one key per browser (localStorage).
      try {
        const key = "sareeDesignSessionId";
        let sid = window.localStorage.getItem(key);
        if (!sid) {
          sid = `sid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
          window.localStorage.setItem(key, sid);
        }
        formDataToSend.append("sessionId", sid);
      } catch {
        // ignore
      }

      // ✅ Use files from ref
      Object.entries(originalFilesRef.current).forEach(([partName, file]) => {
        if (file) {
          formDataToSend.append(partName, file);
          console.log(`Added ${partName} to FormData`);
        }
      });

      if (userFeedback && String(userFeedback).trim()) {
        formDataToSend.append("userFeedback", String(userFeedback).trim());

        const targetsToSend = Array.isArray(feedbackTargetsOverride)
          ? feedbackTargetsOverride
          : [];
        if (targetsToSend.length > 0) {
          formDataToSend.append('feedbackTargets', JSON.stringify(targetsToSend));
        }

        // Use ONLY the last generated saree *design* as the master reference.
        // Do NOT fall back to try-on outputs (they include lighting/shadows and can shift colors).
        const memoryKey = formData?.sareeDesignMemoryKey;
        if (memoryKey) {
          formDataToSend.append("masterReferenceMemoryKey", String(memoryKey));
        } else {
          const masterRef = formData?.sareeDesignUrl;
          if (masterRef) {
            formDataToSend.append("masterReferenceUrl", masterRef);
          }
        }

        // Prefer editing the final front/back views from memory when available.
        const frontKey = formData?.frontViewMemoryKey;
        const backKey = formData?.backViewMemoryKey;
        if (frontKey) formDataToSend.append('masterReferenceFrontMemoryKey', String(frontKey));
        if (backKey) formDataToSend.append('masterReferenceBackMemoryKey', String(backKey));
      }

      console.log("Sending 6 saree parts to AI backend...");

      const response = await fetch("/api/drape-saree-parts", {
        method: "POST",
        body: formDataToSend,
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        console.log("AI generation successful!");
        console.log(`Model used: ${data.model || 'Unknown'}`);

        // Persist the underlying design URL for feedback-driven regeneration.
        if (data.sareeDesignUrl) {
          onChange("sareeDesignUrl", data.sareeDesignUrl);
        }

        if (data.sareeDesignMemoryKey) {
          onChange("sareeDesignMemoryKey", data.sareeDesignMemoryKey);
        }

        if (data.frontViewMemoryKey) {
          onChange('frontViewMemoryKey', data.frontViewMemoryKey);
        }
        if (data.backViewMemoryKey) {
          onChange('backViewMemoryKey', data.backViewMemoryKey);
        }

        // Store generated views (single URLs, not arrays)
        onChange("generatedSareeViews", {
          front: data.frontView,
          back: data.backView
        });
        onChange("generatedSareeUrls", data.generatedUrls);
        onChange("hasGeneratedSaree", true);

        // For imageUrls, use the generated views as primary
        const generatedUrls = [
          data.frontView,
          data.backView,
        ].filter(url => url);

        const partUrls = [
          sareeParts['saree-border']?.url,
          sareeParts['blouse-border']?.url,
          sareeParts['saree-body']?.url,
          sareeParts['blouse-body']?.url,
          sareeParts['saree-pallu']?.url,
          sareeParts['saree-pleats']?.url,
        ];

        const updatedImageUrls = [...generatedUrls, ...partUrls].filter(url => url);
        onChange("imageUrls", updatedImageUrls);

        if (data.uploadedParts) {
          onChange("uploadedParts", data.uploadedParts);
        }

        console.log("Complete saree generation finished!");
        console.log("Generated views:", Object.keys(data.generatedUrls));
      } else {
        setError(data.error || "Failed to generate complete saree from parts");
        console.error("AI Backend error:", data);
      }
    } catch (err) {
      console.error("Network/API error:", err);
      setError(`API Error: ${err.message || "Failed to connect to AI service"}`);
    } finally {
      setGeneratingComplete(false);
    }
  };

  const buildTrainingPayload = () => {
    const inputs = {};
    Object.keys(partLabels).forEach((k) => {
      const url = sareeParts?.[k]?.url;
      if (url) inputs[k] = url;
    });

    const outputs = {
      front: formData.generatedSareeViews?.front || null,
      back: formData.generatedSareeViews?.back || null,
    };

    return {
      verdict: 'good',
      note: '',
      inputs,
      outputs,
      meta: {
        app: 'DigiWearHouse',
        createdFrom: 'SareePartsUploader',
      }
    };
  };

  const handleMarkGood = async () => {
    if (!formData.generatedSareeViews?.front || !formData.generatedSareeViews?.back) {
      setFeedbackStatus({ type: 'error', message: 'Generate both front and back views first.' });
      return;
    }
    setFeedbackSaving(true);
    setFeedbackStatus(null);
    try {
      const payload = buildTrainingPayload();
      const resp = await fetch('/api/training-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.success) {
        throw new Error(data.error || `HTTP ${resp.status}`);
      }
      setFeedbackStatus({ type: 'success', message: 'Thanks for the feedback.' });
    } catch (e) {
      setFeedbackStatus({ type: 'error', message: `Failed to save: ${e.message}` });
    } finally {
      setFeedbackSaving(false);
    }
  };

  const handleOpenBadModal = () => {
    setFeedbackText('');
    setFeedbackStatus(null);
    setFeedbackTargets(['saree-border']);
    setFeedbackModalOpen(true);
  };

  const handleRetryWithFeedback = async () => {
    const msg = String(feedbackText || '').trim();
    if (!msg) {
      setFeedbackStatus({ type: 'error', message: 'Please describe what went wrong before retrying.' });
      return;
    }
    if (!Array.isArray(feedbackTargets) || feedbackTargets.length === 0) {
      setFeedbackStatus({ type: 'error', message: 'Please select at least one thing to fix.' });
      return;
    }
    if (!formData.generatedSareeViews?.front && !formData.generatedSareeViews?.back) {
      setFeedbackStatus({ type: 'error', message: 'Generate an image first, then use Fix.' });
      return;
    }

    setFeedbackModalOpen(false);
    setGeneratingComplete(true);
    setError(null);
    setFeedbackStatus(null);

    try {
      // Re-generate the saree design using feedback, then re-run virtual try-on.
      // Allow multi-select targets; fold into one clear instruction string.
      const targetLabels = feedbackTargets
        .map((t) => partLabels?.[t]?.name || t)
        .filter(Boolean);
      const feedbackForModel = `Fix targets: ${targetLabels.join(', ')}.\n\nUser description:\n${msg}`;

      await handleAutoGenerateCompleteSaree(feedbackForModel, feedbackTargets);
      setFeedbackStatus({ type: 'success', message: 'Generated a new design using your feedback.' });
    } catch (e) {
      setError(`Fix failed: ${e.message}`);
    } finally {
      setGeneratingComplete(false);
    }
  };



  const handleFileInput = (e, partName) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file, partName);
    }
  };

  //   const handleAutoGenerateCompleteSaree = async () => {
  //     if (!getAllPartsUploaded()) {
  //       console.log("Not all parts uploaded yet");
  //       return;
  //     }

  //     setGeneratingComplete(true);
  //     setError(null);
  //     console.log("Starting AI saree generation for all 4 views...");

  //     try {
  //       const formDataToSend = new FormData();

  //       Object.entries(sareeParts).forEach(([partName, partData]) => {
  //         if (partData.file) {
  //           formDataToSend.append(partName, partData.file);
  //         }
  //       });

  //       console.log("Sending 4 saree parts to AI backend...");

  //       const response = await fetch("/api/drape-saree-parts", {
  //         method: "POST",
  //         body: formDataToSend,
  //       });

  //       if (!response.ok) {
  //         const errorData = await response.json().catch(() => ({}));
  //         throw new Error(
  //           errorData.error || `HTTP ${response.status}: ${response.statusText}`
  //         );
  //       }

  //       const data = await response.json();

  //       if (data.success) {
  //         console.log("AI generation successful for all views!");

  //         // Store all generated views and URLs
  //         onChange("generatedSareeViews", data.generatedViews);
  //         onChange("generatedSareeUrls", data.generatedUrls);
  // onChange("hasGeneratedSaree", true);

  //         // Set the front view as the primary image (index 0)
  //         // const frontViewUrl = data.generatedUrls.front;
  //         // if (frontViewUrl) {
  //         //   const currentImageUrls = formData.imageUrls || [];
  //         //   const updatedImageUrls = [frontViewUrl, ...currentImageUrls.slice(1)];
  //         //   onChange('imageUrls', updatedImageUrls);
  //         // }

  //         const generatedUrls = [
  //           data.generatedUrls.front,
  //           data.generatedUrls.back,
  //           data.generatedUrls.side,
  //           data.generatedUrls.sitting,
  //         ];

  //         const partUrls = [
  //           sareeParts.body?.url,
  //           sareeParts.pleats?.url,
  //           sareeParts.border?.url,
  //           sareeParts.blouse?.url,
  //           sareeParts.pallu?.url,
  //         ];

  //         const updatedImageUrls = [...generatedUrls, ...partUrls];
  //         onChange("imageUrls", updatedImageUrls);

  //         if (data.uploadedParts) {
  //           onChange("uploadedParts", data.uploadedParts);
  //         }

  //         console.log("Complete saree generation process finished!");
  //         console.log("Generated views:", Object.keys(data.generatedViews));
  //       } else {
  //         setError(data.error || "Failed to generate complete saree from parts");
  //         console.error("AI Backend error:", data);
  //       }
  //     } catch (err) {
  //       console.error("Network/API error:", err);
  //       setError(
  //         `API Error: ${err.message || "Failed to connect to AI service"}`
  //       );
  //     } finally {
  //       setGeneratingComplete("done");
  //       // setGeneratingComplete(false);

  //     }
  //   };

  const clearPart = (partName) => {
    if (sareeParts[partName].preview) {
      URL.revokeObjectURL(sareeParts[partName].preview);
    }

    const updatedParts = {
      ...sareeParts,
      [partName]: { file: null, preview: null, url: null },
    };

    onChange("sareeParts", updatedParts);

    const currentImageUrls = formData.imageUrls || [];
    const partIndex = Object.keys(partLabels).indexOf(partName);
    const newImageUrls = [...currentImageUrls];
    newImageUrls[partIndex + 1] = null;
    onChange("imageUrls", newImageUrls);
  };

  const clearAllParts = () => {
    Object.keys(sareeParts).forEach((partName) => {
      if (sareeParts[partName].preview) {
        URL.revokeObjectURL(sareeParts[partName].preview);
      }
    });

    const clearedParts = {
      'saree-border': { file: null, preview: null, url: null },
      'blouse-border': { file: null, preview: null, url: null },
      'saree-body': { file: null, preview: null, url: null },
      'blouse-body': { file: null, preview: null, url: null },
      'saree-pallu': { file: null, preview: null, url: null },
      'saree-pleats': { file: null, preview: null, url: null },
    };

    onChange("sareeParts", clearedParts);
    onChange("generatedSareeViews", null);
    onChange("generatedSareeUrls", null);
    onChange("imageUrls", []);
    onChange("uploadedParts", null);
    setError(null);
    setFeedbackStatus(null);
    setFeedbackModalOpen(false);
    setFeedbackText('');
    setHasGeneratedOnce(false);
    originalFilesRef.current = {};
  };

  const getUploadedPartsCount = () => {
    return Object.values(sareeParts).filter((part) => part.file).length;
  };

  const getAllPartsUploaded = () => {
    return Object.values(sareeParts).every((part) => part.file);
  };

  const getGeneratedViewsCount = () => {
    if (!formData.generatedSareeViews) return 0;
    return Object.values(formData.generatedSareeViews).filter(url => url).length;
  };

  // const base64ToBlob = async (base64String) => {
  //   const response = await fetch(base64String);
  //   return response.blob();
  // };

  const downloadView = (viewType) => {
    const viewData = formData.generatedSareeViews?.[viewType];
    const viewUrl = formData.generatedSareeUrls?.[viewType];

    if (viewUrl) {
      const link = document.createElement("a");
      link.href = viewUrl;
      link.download = `ai-generated-saree-${viewType}-view.png`;
      link.click();
    }
  };

  const FashionLoader = () => {
    return (
      <div className="flex flex-col items-center justify-center p-6 animate-pulse">
        <div className="w-20 h-20 rounded-full border-4 border-t-transparent border-pink-400 animate-spin mb-4"></div>
        <p className="text-pink-600 font-medium text-sm tracking-wide">
          Generating stunning saree view...
        </p>
        <p className="text-gray-500 text-xs mt-1">
          AI is assembling your saree parts <br />
          It Takes around 30 seconds...
        </p>
      </div>
    );
  };

  if (!formData || !formData.sareeParts) {
    return (
      <div className="text-center p-10 text-gray-500">
        Loading saree uploader...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Photos</h1>
        <p className="text-gray-600 mb-4">Add Photos of your saree parts</p>
      </div>
      <div className="pb-6">
        <button
          onClick={() => navigate("/instructions")}
          className="text-[#800000] cursor-pointer hover:text-blue-700 font-medium flex items-center space-x-2"
        >
          <span>View Instructions</span>
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

      {/* Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {Object.entries(partLabels).map(([partName, partInfo]) => (
          <div
            key={partName}
            className="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-[#800000] transition-all duration-200"
          >
            {!sareeParts[partName].file ? (
              <div
                className={`p-8 text-center transition-all duration-200 ${draggedPart === partName
                    ? "border-blue-400 bg-blue-50"
                    : "hover:bg-gray-50"
                  }`}
                onDragEnter={(e) => handleDrag(e, partName)}
                onDragLeave={(e) => handleDrag(e, partName)}
                onDragOver={(e) => handleDrag(e, partName)}
                onDrop={(e) => handleDrop(e, partName)}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mb-4"
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
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {partInfo.name}
                  </h3>
                  <label className="inline-flex items-center px-6 py-2 bg-black text-white rounded-lg cursor-pointer transition-colors font-medium">
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileInput(e, partName)}
                      disabled={uploading || generatingComplete}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="relative p-4">
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={sareeParts[partName].preview}
                    alt={`${partInfo.name} preview`}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => clearPart(partName)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    disabled={uploading || generatingComplete}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {partInfo.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span className="text-sm text-green-600 font-medium">
                      Uploaded ✓
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Uploaded: {getUploadedPartsCount()}/6 parts
            {formData.generatedSareeViews && (
              <span className="ml-2 text-green-600">
                {generatingComplete
                  ? "(Generating...)"
                  : `(Generated: ${getGeneratedViewsCount()}/2 views)`}
              </span>
            )}
          </span>
          {getUploadedPartsCount() > 0 && (
            <button
              onClick={clearAllParts}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(getUploadedPartsCount() / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 mb-6">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loader while AI is generating */}
      {generatingComplete && (
        <div className="mt-4">
          <FashionLoader />
        </div>
      )}

      {/* Generated Saree Views Display - Single Image per View */}
      {formData.generatedSareeViews && (
        <div className="bg-gradient-to-br rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-600" />
            AI Generated Saree Views
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData.generatedSareeViews).map(
              ([viewType, imageUrl]) => {
                const viewLabel = viewLabels[viewType] || { name: viewType, description: '', icon: '👗' };

                if (!imageUrl) return null;

                return (
                  <div key={viewType} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-2xl">{viewLabel.icon}</span>
                      {viewLabel.name}
                    </h5>

                    <div className="relative overflow-hidden rounded-md w-full">
                      <img
                        src={imageUrl}
                        alt={`${viewLabel.name}`}
                        className="w-full h-[520px] object-contain bg-white rounded-md"
                      />
                    </div>

                    <p className="text-xs text-gray-600 mt-2">
                      {viewLabel.description}
                    </p>
                  </div>
                );
              }
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleMarkGood}
                disabled={feedbackSaving || generatingComplete}
                className="px-4 py-2 rounded-lg bg-black text-white font-medium disabled:opacity-60"
              >
                {feedbackSaving ? 'Saving…' : 'Good'}
              </button>
              <button
                onClick={handleOpenBadModal}
                disabled={generatingComplete}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-medium disabled:opacity-60"
              >
                Bad
              </button>
            </div>

            {feedbackStatus && (
              <div className={`p-3 rounded-lg border ${feedbackStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                {feedbackStatus.message}
              </div>
            )}
          </div>
        </div>
      )}

      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">What went wrong?</h3>
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Example: “Front view has fabric panel in background” or “Two women side-by-side collage”.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-2">What should be fixed? (select all that apply)</label>
            <div className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-3">
              {[
                { key: 'saree-border', label: 'Saree border' },
                { key: 'blouse-border', label: 'Blouse border' },
                { key: 'saree-pallu', label: 'Saree pallu' },
                { key: 'saree-pleats', label: 'Saree pleats' },
                { key: 'saree-body', label: 'Saree body color/pattern' },
                { key: 'blouse-body', label: 'Blouse body color/pattern' },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={feedbackTargets.includes(opt.key)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFeedbackTargets((prev) => {
                        const cur = Array.isArray(prev) ? prev : [];
                        if (checked) return Array.from(new Set([...cur, opt.key]));
                        return cur.filter((x) => x !== opt.key);
                      });
                    }}
                    disabled={generatingComplete}
                  />
                  <span className="text-gray-800">{opt.label}</span>
                </label>
              ))}
            </div>

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full min-h-[110px] border border-gray-300 rounded-lg p-3 text-sm focus:outline-none"
              placeholder="Describe what should change…"
              disabled={generatingComplete}
            />

            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRetryWithFeedback}
                disabled={generatingComplete}
                className="px-4 py-2 rounded-lg bg-black text-white font-medium disabled:opacity-60"
              >
                Fix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SareePartsUploader;