"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Loader2, ArrowLeft } from "lucide-react";
import { fetchPost, fetchGet } from "@/lib/fetch";
import { useToast } from "@/contexts/ToastContext";

interface Project {
  id: string;
  title: string;
  status: string;
}

export function ProductForm() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [isPublic, setIsPublic] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});

  // Load projects for dropdown
  useEffect(() => {
    fetchGet<Project[]>("/api/projects").then((result) => {
      if (result.ok) setProjects(result.data);
    });
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  }, [name, slugManuallyEdited]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(slug))
      newErrors.slug = "Slug must be lowercase letters, numbers, and hyphens only";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      const body = {
        name,
        slug,
        tagline: tagline || undefined,
        description: description || undefined,
        projectId: projectId || undefined,
        brandColor,
        isPublic,
      };

      const result = await fetchPost<{ id: string }>("/api/products", body);

      if (result.ok) {
        toast.success("Product created");
        router.push(`/products/${result.data.id}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Package className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Create Product
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Set up your product&apos;s public page and launch details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Product Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., LaunchPad Pro"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:bg-slate-700 dark:text-white ${
                errors.name ? "border-red-500" : "border-slate-300 dark:border-slate-600"
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setSlug(e.target.value);
              }}
              placeholder="e.g., launchpad-pro"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:bg-slate-700 dark:text-white ${
                errors.slug ? "border-red-500" : "border-slate-300 dark:border-slate-600"
              }`}
            />
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Used in the public URL. Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          {/* Tagline */}
          <div>
            <label htmlFor="tagline" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Tagline
            </label>
            <input
              id="tagline"
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g., Ship faster, launch smarter"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your product does..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Project Link */}
          <div>
            <label htmlFor="projectId" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Linked Project (optional)
            </label>
            <select
              id="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:bg-slate-700 dark:text-white"
            >
              <option value="">No linked project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Color & Public Toggle Row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="brandColor" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="brandColor"
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">{brandColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Visibility
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Make product public
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
