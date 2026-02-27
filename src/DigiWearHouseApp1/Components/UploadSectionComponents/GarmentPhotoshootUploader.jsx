/**
 * GarmentPhotoshootUploader
 * ─────────────────────────
 * For non-saree dress types: Lehenga, Anarkali, Sharara, Wedding, Salwar Suit, Kurta-Sets
 *
 * Upload fields:
 *   • full-dress  — used by Google Virtual Try-On as the front-view garment
 *   • top-front   — stored for catalog / reference
 *   • top-back    — stored for catalog / reference
 *   • bottom      — stored for catalog / reference
 *
 * Generation flow:
 *   [full-dress] → Google VTO → front view
 *               → Gemini → left, right, back views (streamed SSE)
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle, X, Upload } from "lucide-react";
import { uploadToCloudinary } from "../../utilities/cloudinary";

const FIELDS = [
  {
    key: "full-dress",
    label: "Full Dress",
    hint: "Used for virtual try-on (required)",
    required: true,
  },
  {
    key: "top-front",
    label: "Top – Front",
    hint: "Front view of the top / kurti",
    required: false,
  },
  {
    key: "top-back",
    label: "Top – Back",
    hint: "Back view of the top / kurti",
    required: false,
  },
  {
    key: "bottom",
    label: "Bottom",
    hint: "Skirt / salwar / lehenga bottom",
    required: false,
  },
];

const VIEW_ORDER = ["front", "left", "right", "back"];

const GarmentPhotoshootUploader = ({ formData = {}, onChange = () => {} }) => {
  // ── file & preview state ──────────────────────────────────────────────────
  const [files, setFiles] = useState({
    "full-dress": null,
    "top-front": null,
    "top-back": null,
    bottom: null,
  });
  const [previews, setPreviews] = useState({});
  const [cloudinaryUrls, setCloudinaryUrls] = useState({});
  const [uploading, setUploading] = useState({});

  // ── photoshoot state ──────────────────────────────────────────────────────
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(null); // front|left|right|back
  const [status, setStatus] = useState(null);
  const [views, setViews] = useState({});
  const viewsRef = useRef({});
  const sseRef = useRef(null);

  const [error, setError] = useState(null);

  // ── clean up SSE on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      try { sseRef.current?.close?.(); } catch { /* ignore */ }
    };
  }, []);

  // ── preview URLs (object-URL lifecycle) ───────────────────────────────────
  useEffect(() => {
    const newPreviews = {};
    for (const [key, file] of Object.entries(files)) {
      if (file) newPreviews[key] = URL.createObjectURL(file);
    }
    setPreviews(newPreviews);
    return () => {
      for (const url of Object.values(newPreviews)) {
        try { URL.revokeObjectURL(url); } catch { /* ignore */ }
      }
    };
  }, [files]);

  // ── progress ──────────────────────────────────────────────────────────────
  const progressPercent = useMemo(() => {
    const idx = step ? VIEW_ORDER.indexOf(step) : -1;
    if (idx < 0) return generating ? 5 : 0;
    return Math.min(100, Math.round(((idx + 1) / VIEW_ORDER.length) * 100));
  }, [step, generating]);

  // ── helpers ───────────────────────────────────────────────────────────────
  const persistViews = (v) => {
    const urls = VIEW_ORDER.map((k) => v[k]).filter(Boolean);
    try { onChange("imageUrls", urls); } catch { /* ignore */ }
    try { onChange("generatedGarmentViews", v); } catch { /* ignore */ }
    try { onChange("hasGeneratedGarment", urls.length > 0); } catch { /* ignore */ }
  };

  const handleFileChange = async (key, file) => {
    if (!file) return;
    setFiles((prev) => ({ ...prev, [key]: file }));
    setError(null);

    // Upload to Cloudinary immediately so the URL is ready for the start call
    setUploading((prev) => ({ ...prev, [key]: true }));
    try {
      const url = await uploadToCloudinary(file);
      setCloudinaryUrls((prev) => ({ ...prev, [key]: url }));
    } catch (e) {
      setError(`Upload failed for "${key}": ${e?.message || String(e)}`);
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const clearField = (key) => {
    setFiles((prev) => ({ ...prev, [key]: null }));
    setCloudinaryUrls((prev) => ({ ...prev, [key]: undefined }));
  };

  // ── main generation trigger ───────────────────────────────────────────────
  const startGeneration = async () => {
    if (!files["full-dress"]) {
      setError("Please upload the full-dress image first.");
      return;
    }

    setGenerating(true);
    setStep(null);
    setStatus("Preparing generation...");
    setViews({});
    viewsRef.current = {};
    setError(null);

    try { onChange("generatedGarmentViews", null); } catch { /* ignore */ }
    try { onChange("hasGeneratedGarment", false); } catch { /* ignore */ }

    try {
      // Build FormData with the original File objects; server handles upload too.
      // We include all 4 fields that were selected.
      const fd = new FormData();
      for (const [key, file] of Object.entries(files)) {
        if (file) fd.append(key, file);
      }

      const resp = await fetch("/api/garment-photoshoot/start", {
        method: "POST",
        body: fd,
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.jobId) {
        throw new Error(data?.message || data?.error || "Failed to start generation");
      }

      // Open SSE stream
      try { sseRef.current?.close?.(); } catch { /* ignore */ }
      const es = new EventSource(`/api/garment-photoshoot/stream/${data.jobId}`);
      sseRef.current = es;

      es.addEventListener("status", (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          setStep(payload?.step || null);
          setStatus("Generating images...");
        } catch {
          setStatus("Generating images...");
        }
      });

      es.addEventListener("view", (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload?.view && payload?.url) {
            setStatus("Generating images...");
            const next = { ...viewsRef.current, [payload.view]: payload.url };
            viewsRef.current = next;
            setViews(next);
            persistViews(next);
          }
        } catch { /* ignore */ }
      });

      es.addEventListener("done", () => {
        setStatus("Generation complete.");
        setGenerating(false);
        setStep("back");
        const finalViews = viewsRef.current || {};
        persistViews(finalViews);
        try { es.close(); } catch { /* ignore */ }
      });

      es.addEventListener("error", (ev) => {
        try {
          const payload = ev?.data ? JSON.parse(ev.data) : null;
          setError(payload?.message || "Generation error. Please retry.");
        } catch {
          setError("Generation error. Please retry.");
        }
        setGenerating(false);
        try { es.close(); } catch { /* ignore */ }
      });
    } catch (e) {
      setError(e?.message || String(e));
      setGenerating(false);
      setStatus(null);
      setStep(null);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Garment Photoshoot
        </h3>
        <p className="text-sm text-gray-500">
          Upload your garment images. The <strong>full-dress</strong> image is
          required for virtual try-on. Optionally upload top and bottom
          separately for catalog reference.
        </p>
      </div>

      {/* Upload slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map(({ key, label, hint, required }) => {
          const file = files[key];
          const preview = previews[key];
          const isUploading = uploading[key];
          const uploaded = !!cloudinaryUrls[key];

          return (
            <div
              key={key}
              className="border-2 border-dashed border-gray-200 rounded-xl p-3 flex flex-col gap-2 bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </span>
                {isUploading && (
                  <span className="text-xs text-blue-600 animate-pulse">uploading…</span>
                )}
                {!isUploading && uploaded && (
                  <CheckCircle size={14} className="text-green-500" />
                )}
              </div>

              {!file ? (
                <label className="cursor-pointer flex flex-col items-center justify-center h-28 rounded-lg border border-dashed border-gray-300 bg-white hover:bg-gray-50 transition gap-2">
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-xs text-gray-500 text-center px-2">{hint}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (f) handleFileChange(key, f);
                    }}
                    disabled={generating}
                  />
                </label>
              ) : (
                <div className="relative rounded-lg overflow-hidden bg-gray-100 h-28">
                  {preview && (
                    <img
                      src={preview}
                      alt={label}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    onClick={() => clearField(key)}
                    disabled={generating}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow hover:bg-gray-100"
                  >
                    <X size={14} className="text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Generate button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <button
          onClick={startGeneration}
          disabled={generating || !files["full-dress"]}
          className="px-4 py-2 rounded-lg bg-black text-white font-medium disabled:opacity-60"
        >
          {generating ? "Generating…" : "Generate Views"}
        </button>
        {!generating && status && (
          <span className="text-sm text-gray-700">{status}</span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Progress loader */}
      {generating && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-pink-400 animate-spin flex-shrink-0" />
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
              {status && (
                <p className="text-xs text-gray-600 mt-2">{status}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated views */}
      {Object.keys(views).length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Generated Views
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {VIEW_ORDER.map((viewKey) => {
              const url = views[viewKey];
              if (!url) return null;
              return (
                <div
                  key={viewKey}
                  className="bg-white border-2 border-gray-200 rounded-lg p-3"
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {viewKey} view
                  </p>
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-md">
                    <img
                      src={url}
                      alt={`${viewKey} view`}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-blue-600 hover:underline block"
                  >
                    Open full size ↗
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GarmentPhotoshootUploader;
