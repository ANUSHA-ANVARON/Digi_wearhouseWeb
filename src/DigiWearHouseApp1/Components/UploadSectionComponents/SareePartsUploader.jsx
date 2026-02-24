import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../../utilities/cloudinary";

const SareePartsUploader = ({ formData = {}, onChange = () => {} }) => {
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const [photoshootFile, setPhotoshootFile] = useState(null);
  const [photoshootUploading, setPhotoshootUploading] = useState(false);
  const [photoshootStep, setPhotoshootStep] = useState(null); // front|left|right|back
  const [photoshootStatus, setPhotoshootStatus] = useState(null);
  const [photoshootViews, setPhotoshootViews] = useState({});
  const photoshootSourceRef = React.useRef(null);
  const photoshootViewsRef = React.useRef({});

  const [palluFile, setPalluFile] = useState(null);
  const [bodyFile, setBodyFile] = useState(null);

  const [palluPreviewUrl, setPalluPreviewUrl] = useState(null);
  const [bodyPreviewUrl, setBodyPreviewUrl] = useState(null);

  const [inputUploading, setInputUploading] = useState({
    saree: false,
    pallu: false,
    body: false,
  });

  const sareeInputUrlsRef = React.useRef(formData?.sareeInputUrls || {});

  useEffect(() => {
    sareeInputUrlsRef.current = formData?.sareeInputUrls || {};
  }, [formData?.sareeInputUrls]);

  const [photoshootPreviewUrl, setPhotoshootPreviewUrl] = useState(null);

  useEffect(() => {
    if (!palluFile) {
      setPalluPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(palluFile);
    setPalluPreviewUrl(url);
    return () => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    };
  }, [palluFile]);

  useEffect(() => {
    if (!bodyFile) {
      setBodyPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(bodyFile);
    setBodyPreviewUrl(url);
    return () => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    };
  }, [bodyFile]);

  const composeAndPersistImageUrls = (viewsArg, inputUrlsArg) => {
    const views = viewsArg || photoshootViewsRef.current || {};
    const inputUrls = inputUrlsArg || sareeInputUrlsRef.current || {};

    const nextImageUrls = [
      views.front,
      views.left,
      views.right,
      views.back,
      inputUrls.saree,
      inputUrls.pallu,
      inputUrls.body,
    ].filter(Boolean);

    try {
      onChange("imageUrls", nextImageUrls);
    } catch {
      // ignore
    }
  };

  const uploadAndPersistInputImage = async (kind, file) => {
    if (!file) return;

    setInputUploading((prev) => ({ ...prev, [kind]: true }));
    try {
      const url = await uploadToCloudinary(file);
      const next = { ...(sareeInputUrlsRef.current || {}), [kind]: url };
      sareeInputUrlsRef.current = next;
      try {
        onChange("sareeInputUrls", next);
      } catch {
        // ignore
      }

      composeAndPersistImageUrls(undefined, next);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setInputUploading((prev) => ({ ...prev, [kind]: false }));
    }
  };

  const clearInputKind = (kind) => {
    const next = { ...(sareeInputUrlsRef.current || {}), [kind]: null };
    sareeInputUrlsRef.current = next;

    try {
      onChange("sareeInputUrls", next);
    } catch {
      // ignore
    }

    composeAndPersistImageUrls(undefined, next);
  };

  const progressPercent = useMemo(() => {
    const order = ["front", "left", "right", "back"];
    const idx = photoshootStep ? order.indexOf(photoshootStep) : -1;
    if (idx < 0) return photoshootUploading ? 5 : 0;
    return Math.min(100, Math.round(((idx + 1) / order.length) * 100));
  }, [photoshootStep, photoshootUploading]);

  useEffect(() => {
    return () => {
      try {
        photoshootSourceRef.current?.close?.();
      } catch {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    if (!photoshootFile) {
      setPhotoshootPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(photoshootFile);
    setPhotoshootPreviewUrl(url);
    return () => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    };
  }, [photoshootFile]);

  const startPhotoshoot = async () => {
    if (!photoshootFile) {
      setError("Please upload a saree image first.");
      return;
    }

    setPhotoshootUploading(true);
    setPhotoshootStep(null);
    setPhotoshootStatus("Preparing generation...");
    setPhotoshootViews({});
    photoshootViewsRef.current = {};
    setError(null);

    // Clear previously generated views so Submit gating is accurate
    try {
      onChange("generatedSareeViews", null);
      onChange("hasGeneratedSaree", false);
    } catch {
      // ignore
    }

    try {
      const fd = new FormData();
      fd.append("sareeImage", photoshootFile);

      const resp = await fetch("/api/photoshoot/start", {
        method: "POST",
        body: fd,
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.jobId) {
        throw new Error(data?.message || data?.error || "Failed to start generation");
      }

      try {
        photoshootSourceRef.current?.close?.();
      } catch {
        // ignore
      }

      const es = new EventSource(`/api/photoshoot/stream/${data.jobId}`);
      photoshootSourceRef.current = es;

      es.addEventListener("status", (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          setPhotoshootStep(payload?.step || null);
          setPhotoshootStatus("Generating images...");
        } catch {
          setPhotoshootStatus("Generating images...");
        }
      });

      es.addEventListener("view", (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload?.view && payload?.url) {
            setPhotoshootStatus("Generating images...");
            const next = {
              ...photoshootViewsRef.current,
              [payload.view]: payload.url,
            };
            photoshootViewsRef.current = next;
            setPhotoshootViews(next);

            // Persist to parent form state so Submit works
            try {
              onChange("generatedSareeViews", next);
              composeAndPersistImageUrls(next);
              onChange("hasGeneratedSaree", true);
            } catch {
              // ignore
            }
          }
        } catch {
          // ignore
        }
      });

      es.addEventListener("done", () => {
        setPhotoshootStatus("Generation complete.");
        setPhotoshootUploading(false);
        setPhotoshootStep("back");

        // Ensure final state is persisted
        try {
          const finalViews = photoshootViewsRef.current || {};
          onChange("generatedSareeViews", finalViews);
          composeAndPersistImageUrls(finalViews);
          onChange("hasGeneratedSaree", true);
        } catch {
          // ignore
        }
        try {
          es.close();
        } catch {
          // ignore
        }
      });

      es.addEventListener("error", (ev) => {
        try {
          const payload = ev?.data ? JSON.parse(ev.data) : null;
          setError(payload?.message || "Generation error. Please retry.");
        } catch {
          setError("Generation error. Please retry.");
        }
        setPhotoshootUploading(false);
        try {
          es.close();
        } catch {
          // ignore
        }
      });
    } catch (e) {
      setError(e?.message || String(e));
      setPhotoshootUploading(false);
      setPhotoshootStatus(null);
      setPhotoshootStep(null);
    }
  };

  const PhotoshootLoader = () => {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-pink-400 animate-spin" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-800">Generating…</p>
              <p className="text-xs text-gray-600">{progressPercent}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {photoshootStatus && (
              <p className="text-xs text-gray-600 mt-2">{photoshootStatus}</p>
            )}
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Photos</h1>
        <p className="text-gray-600 mb-4">
          Upload 3 saree images (Saree, Pallu, Body). Generation depends only on the Saree image.
        </p>
      </div>

      <div className="pb-6">
        <button
          onClick={() => navigate("/instructions")}
          className="text-[#800000] cursor-pointer hover:text-blue-700 font-medium flex items-center space-x-2"
        >
          <span>View Instructions</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Input upload cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Saree */}
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-[#800000] transition-all duration-200">
          {!photoshootFile ? (
            <div className="p-8 text-center hover:bg-gray-50 transition-all duration-200">
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Saree Image</h3>
                <label className="inline-flex items-center px-6 py-2 bg-black text-white rounded-lg cursor-pointer transition-colors font-medium">
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setPhotoshootFile(f);
                      setError(null);
                      if (f) uploadAndPersistInputImage("saree", f);
                    }}
                    disabled={photoshootUploading || inputUploading.saree}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="relative p-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <img src={photoshootPreviewUrl} alt="Saree preview" className="w-full h-48 object-cover" />
                <button
                  onClick={() => {
                    setPhotoshootFile(null);
                    setPhotoshootViews({});
                    photoshootViewsRef.current = {};
                    setPhotoshootStatus(null);
                    setPhotoshootStep(null);
                    setError(null);

                    clearInputKind("saree");

                    try {
                      onChange("generatedSareeViews", null);
                      onChange("hasGeneratedSaree", false);
                    } catch {
                      // ignore
                    }
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={photoshootUploading || inputUploading.saree}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Saree Image</h3>
                <div className="flex items-center justify-center gap-2">
                  {inputUploading.saree ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-gray-500 animate-spin" />
                      <span className="text-sm text-gray-600 font-medium">Uploading…</span>
                    </>
                  ) : formData?.sareeInputUrls?.saree ? (
                    <>
                      <CheckCircle className="text-green-500" size={16} />
                      <span className="text-sm text-green-600 font-medium">Uploaded ✓</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-600 font-medium">Pending upload</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pallu */}
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-[#800000] transition-all duration-200">
          {!palluFile ? (
            <div className="p-8 text-center hover:bg-gray-50 transition-all duration-200">
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Saree Pallu</h3>
                <label className="inline-flex items-center px-6 py-2 bg-black text-white rounded-lg cursor-pointer transition-colors font-medium">
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setPalluFile(f);
                      setError(null);
                      if (f) uploadAndPersistInputImage("pallu", f);
                    }}
                    disabled={photoshootUploading || inputUploading.pallu}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="relative p-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <img src={palluPreviewUrl} alt="Pallu preview" className="w-full h-48 object-cover" />
                <button
                  onClick={() => {
                    setPalluFile(null);
                    setError(null);
                    clearInputKind("pallu");
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={photoshootUploading || inputUploading.pallu}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Saree Pallu</h3>
                <div className="flex items-center justify-center gap-2">
                  {inputUploading.pallu ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-gray-500 animate-spin" />
                      <span className="text-sm text-gray-600 font-medium">Uploading…</span>
                    </>
                  ) : formData?.sareeInputUrls?.pallu ? (
                    <>
                      <CheckCircle className="text-green-500" size={16} />
                      <span className="text-sm text-green-600 font-medium">Uploaded ✓</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-600 font-medium">Pending upload</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-[#800000] transition-all duration-200">
          {!bodyFile ? (
            <div className="p-8 text-center hover:bg-gray-50 transition-all duration-200">
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Saree Body</h3>
                <label className="inline-flex items-center px-6 py-2 bg-black text-white rounded-lg cursor-pointer transition-colors font-medium">
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setBodyFile(f);
                      setError(null);
                      if (f) uploadAndPersistInputImage("body", f);
                    }}
                    disabled={photoshootUploading || inputUploading.body}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="relative p-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <img src={bodyPreviewUrl} alt="Body preview" className="w-full h-48 object-cover" />
                <button
                  onClick={() => {
                    setBodyFile(null);
                    setError(null);
                    clearInputKind("body");
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={photoshootUploading || inputUploading.body}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Saree Body</h3>
                <div className="flex items-center justify-center gap-2">
                  {inputUploading.body ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-gray-500 animate-spin" />
                      <span className="text-sm text-gray-600 font-medium">Uploading…</span>
                    </>
                  ) : formData?.sareeInputUrls?.body ? (
                    <>
                      <CheckCircle className="text-green-500" size={16} />
                      <span className="text-sm text-green-600 font-medium">Uploaded ✓</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-600 font-medium">Pending upload</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Action */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-6">
        <button
          onClick={startPhotoshoot}
          disabled={photoshootUploading || !photoshootFile}
          className="px-4 py-2 rounded-lg bg-black text-white font-medium disabled:opacity-60"
        >
          {photoshootUploading ? "Generating..." : "Generate"}
        </button>
        {!photoshootUploading && photoshootStatus && (
          <span className="text-sm text-gray-700">{photoshootStatus}</span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 mb-6">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Real-time loader */}
      {photoshootUploading && (
        <div className="mb-6">
          <PhotoshootLoader />
        </div>
      )}

      {Object.keys(photoshootViews || {}).length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(photoshootViews).map(([viewType, imageUrl]) => {
            if (!imageUrl) return null;

            return (
              <div key={viewType} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <div className="relative overflow-hidden rounded-md w-full">
                  <img
                    src={imageUrl}
                    alt="Generated view"
                    className="w-full h-[520px] object-contain bg-white rounded-md"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SareePartsUploader;