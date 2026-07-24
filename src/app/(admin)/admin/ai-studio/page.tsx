"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

const MODELS = [
  "zoe", "avery", "sam", "taylor", "kendall", "jordan", "casey",
  "alex", "maya", "reece", "lena", "julia", "sophia", "emma", "ava", "fiona",
];
const POSES = [
  "standing", "34turn", "powerstance", "walkingforward", "handinpocket",
  "crossedarms", "back", "overtheshoulder", "seated", "adjustingclothing", "playfulspin",
];
const SCENES = [
  "flowers", "studio", "coloredstudio", "street", "beach", "tropical",
  "goldenlight", "countryside", "cafe", "sunset", "forest", "pool",
];
const QUALITIES = ["standard", "advanced", "premium"];

export default function AiStudioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [model, setModel] = useState("zoe");
  const [pose, setPose] = useState("standing");
  const [scene, setScene] = useState("flowers");
  const [quality, setQuality] = useState("standard");
  const [cutout, setCutout] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setResult(null);
    setError(null);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function generate() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = sessionStorage.getItem("admin_token") || "";
      const fd = new FormData();
      fd.append("file", file);
      fd.append("model", model);
      fd.append("pose", pose);
      fd.append("scene", scene);
      fd.append("quality", quality);
      fd.append("cutout", String(cutout));

      const res = await fetch("/api/admin/ai-model", {
        method: "POST",
        headers: { "x-admin-password": token },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-charcoal">AI Model Studio</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Upload a flat garment photo and generate a model wearing it. Cut-out
            results are added to the scrolling homepage hero automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wide text-charcoal/60 mb-2">
                Flat garment image
              </label>
              <input type="file" accept="image/*" onChange={onPick} className="text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select label="Model" value={model} onChange={setModel} options={MODELS} />
              <Select label="Pose" value={pose} onChange={setPose} options={POSES} />
              <Select label="Scene" value={scene} onChange={setScene} options={SCENES} />
              <Select label="Quality" value={quality} onChange={setQuality} options={QUALITIES} />
            </div>

            <label className="flex items-center gap-2 text-sm text-charcoal">
              <input
                type="checkbox"
                checked={cutout}
                onChange={(e) => setCutout(e.target.checked)}
              />
              Cut out background (transparent PNG for the scrolling hero)
            </label>

            <button
              onClick={generate}
              disabled={!file || loading}
              className="w-full py-3 bg-gold text-black text-sm uppercase tracking-widest font-semibold rounded hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? "Generating…" : "Generate Model Image"}
            </button>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-wide text-charcoal/60 mb-3">
              {result ? "Generated model" : "Flat image preview"}
            </p>
            <div className="aspect-[3/4] bg-gray-50 rounded flex items-center justify-center overflow-hidden">
              {result ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result} alt="Generated model" className="h-full w-full object-contain" />
              ) : preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Flat garment" className="h-full w-full object-contain" />
              ) : (
                <span className="text-charcoal/40 text-sm">No image yet</span>
              )}
            </div>
            {result && (
              <p className="text-xs text-green-700 mt-3">
                Saved and added to the homepage hero. View the{" "}
                <a href="/" target="_blank" className="underline">storefront</a>.
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-charcoal/60 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm capitalize"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
