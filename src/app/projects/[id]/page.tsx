"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  LayoutDashboard, Milestone, Target, CheckSquare, FileText,
  AlertCircle, GitBranch, Cloud, Package, Users, BookOpen,
  Megaphone, ArrowLeft, X, Rocket
} from "lucide-react";

import ProjectHeader from "@/components/projects/detail/ProjectHeader";
import VerticalTabNav, { type TabItem } from "@/components/projects/detail/VerticalTabNav";
import OverviewPanel from "@/components/projects/detail/OverviewPanel";
import MilestonesPanel from "@/components/projects/detail/MilestonesPanel";
import FeaturesPanel from "@/components/projects/detail/FeaturesPanel";
import TasksPanel from "@/components/projects/detail/TasksPanel";
import NotesPanel from "@/components/projects/detail/NotesPanel";
import IssuesPanel from "@/components/projects/detail/IssuesPanel";
import RepositoryPanel from "@/components/projects/detail/RepositoryPanel";
import DeploymentsPanel from "@/components/projects/detail/DeploymentsPanel";
import ProductOverviewPanel from "@/components/products/detail/ProductOverviewPanel";
import WaitlistPanel from "@/components/products/detail/WaitlistPanel";
import ChangelogPanel from "@/components/products/detail/ChangelogPanel";
import MarketingPanel from "@/components/products/detail/MarketingPanel";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Project = any;
type Product = any;

const projectSubTabs: TabItem[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "milestones", label: "Milestones", icon: <Milestone className="w-4 h-4" /> },
  { id: "features", label: "Features", icon: <Target className="w-4 h-4" /> },
  { id: "tasks", label: "Tasks", icon: <CheckSquare className="w-4 h-4" /> },
  { id: "notes", label: "Notes", icon: <FileText className="w-4 h-4" /> },
  { id: "issues", label: "Issues", icon: <AlertCircle className="w-4 h-4" /> },
  { id: "repository", label: "Repository", icon: <GitBranch className="w-4 h-4" /> },
  { id: "deployments", label: "Deployments", icon: <Cloud className="w-4 h-4" /> },
];

const productSubTabs: TabItem[] = [
  { id: "product-overview", label: "Overview", icon: <Package className="w-4 h-4" /> },
  { id: "waitlist", label: "Waitlist", icon: <Users className="w-4 h-4" /> },
  { id: "changelog", label: "Changelog", icon: <BookOpen className="w-4 h-4" /> },
  { id: "marketing", label: "Marketing", icon: <Megaphone className="w-4 h-4" /> },
];

export default function ProjectDetailPage() {
  const router = useRouter();
  const routeParams = useParams<{ id?: string }>();
  const projectId = routeParams?.id;

  const [project, setProject] = useState<Project | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mainTab, setMainTab] = useState<"project" | "product">("project");
  const [projectSubTab, setProjectSubTab] = useState("overview");
  const [productSubTab, setProductSubTab] = useState("product-overview");

  const [showEnableProduct, setShowEnableProduct] = useState(false);
  const [productName, setProductName] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [enablingProduct, setEnablingProduct] = useState(false);

  const hasProduct = !!(product || (project?.Product && project.Product.length > 0));
  const productId = product?.id || project?.Product?.[0]?.id;

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) throw new Error("Failed to load project");
      const data = await res.json();
      setProject(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [projectId, router]);

  const loadProduct = useCallback(async (pid?: string) => {
    const id = pid || productId;
    if (!id) return;
    try {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) setProduct(await res.json());
    } catch {}
  }, [productId]);

  const reload = useCallback(async () => {
    const proj = await loadProject();
    const linkedId = proj?.Product?.[0]?.id;
    if (linkedId) await loadProduct(linkedId);
  }, [loadProject, loadProduct]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const proj = await loadProject();
      const linkedId = proj?.Product?.[0]?.id;
      if (linkedId) await loadProduct(linkedId);
      setLoading(false);
    };
    init();
  }, [loadProject, loadProduct]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "Escape") {
        // handled by child components
        return;
      }
      if (mainTab === "project") {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 8) {
          e.preventDefault();
          setProjectSubTab(projectSubTabs[num - 1].id);
        }
      }
      if (mainTab === "product") {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 4) {
          e.preventDefault();
          setProductSubTab(productSubTabs[num - 1].id);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mainTab]);

  const handleSaveProject = async (data: Record<string, unknown>) => {
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await reload();
  };

  const handleDeleteProject = async () => {
    await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    router.push("/projects");
  };

  const handleEnableProduct = async () => {
    if (!productName.trim() || !productSlug.trim()) return;
    setEnablingProduct(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/enable-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: productName.trim(), slug: productSlug.trim() }),
      });
      if (res.ok) {
        const prod = await res.json();
        setProduct(prod);
        setShowEnableProduct(false);
        setMainTab("product");
        await reload();
      }
    } finally {
      setEnablingProduct(false);
    }
  };

  const handleQuickAdd = async (type: "task" | "milestone" | "note", data: Record<string, string>) => {
    if (type === "task") {
      await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.title }),
      });
    } else if (type === "milestone") {
      await fetch(`/api/projects/${projectId}/milestones`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.title }),
      });
    } else if (type === "note") {
      await fetch(`/api/projects/${projectId}/docs`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.title, content: "", type: "NOTE" }),
      });
    }
    await reload();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Loading project...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-4">
        <Link href="/projects" className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-4 text-rose-700 dark:text-rose-400">
          {error || "Project not found."}
        </div>
      </div>
    );
  }

  // Enrich sub-tab counts
  const enrichedProjectTabs = projectSubTabs.map(tab => {
    switch (tab.id) {
      case "milestones": return { ...tab, count: project.milestones?.length ?? 0 };
      case "features": return { ...tab, count: project.features?.length ?? 0 };
      case "tasks": return { ...tab, count: project.tasks?.length ?? 0 };
      case "notes": return { ...tab, count: project.ProjectDoc?.length ?? 0 };
      case "issues": return { ...tab, count: project.Requirement?.length ?? 0 };
      default: return tab;
    }
  });

  const enrichedProductTabs = productSubTabs.map(tab => {
    switch (tab.id) {
      case "waitlist": return { ...tab, count: product?.WaitlistEntry?.length ?? 0 };
      case "changelog": return { ...tab, count: product?.ProductChangelog?.length ?? 0 };
      default: return tab;
    }
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Back */}
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      {/* Header */}
      <ProjectHeader
        project={project}
        hasProduct={hasProduct}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        onEnableProduct={() => {
          setProductName(project.title);
          setProductSlug(project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
          setShowEnableProduct(true);
        }}
      />

      {/* Enable Product Modal */}
      {showEnableProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Rocket className="w-5 h-5 text-indigo-600" /> Enable Product
              </h3>
              <button onClick={() => setShowEnableProduct(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Create a product page with waitlist, changelog, and marketing features.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Product Name</label>
                <input className="mt-1 w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white"
                  value={productName} onChange={(e) => setProductName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Slug</label>
                <input className="mt-1 w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white"
                  value={productSlug} onChange={(e) => setProductSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
                <p className="text-xs text-slate-400 mt-1">Used in URL: /p/{productSlug}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowEnableProduct(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">Cancel</button>
              <button onClick={handleEnableProduct} disabled={enablingProduct || !productName.trim() || !productSlug.trim()}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                {enablingProduct ? "Creating..." : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Tab Bar */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-full p-1 w-fit">
        <button
          className={`px-5 py-2 text-sm rounded-full transition-colors ${mainTab === "project" ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white font-medium" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}
          onClick={() => setMainTab("project")}
        >
          Project
        </button>
        <button
          className={`px-5 py-2 text-sm rounded-full transition-colors ${
            !hasProduct ? "text-slate-400 dark:text-slate-600 cursor-not-allowed" :
            mainTab === "product" ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white font-medium" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
          onClick={() => hasProduct && setMainTab("product")}
          disabled={!hasProduct}
          title={!hasProduct ? "Enable Product to access this tab" : undefined}
        >
          Product {!hasProduct && "(not enabled)"}
        </button>
      </div>

      {/* Content with vertical sidebar */}
      <div className="flex gap-6">
        {mainTab === "project" && (
          <>
            <VerticalTabNav tabs={enrichedProjectTabs} activeTab={projectSubTab} onTabChange={setProjectSubTab} />
            <div className="flex-1 min-w-0">
              {projectSubTab === "overview" && <OverviewPanel project={project} onQuickAdd={handleQuickAdd} />}
              {projectSubTab === "milestones" && <MilestonesPanel projectId={project.id} milestones={project.milestones || []} onRefresh={reload} />}
              {projectSubTab === "features" && <FeaturesPanel projectId={project.id} features={project.features || []} onRefresh={reload} />}
              {projectSubTab === "tasks" && <TasksPanel projectId={project.id} tasks={project.tasks || []} features={(project.features || []).map((f: any) => ({ id: f.id, title: f.title }))} milestones={(project.milestones || []).map((m: any) => ({ id: m.id, title: m.title }))} onRefresh={reload} />}
              {projectSubTab === "notes" && <NotesPanel projectId={project.id} docs={project.ProjectDoc || []} onRefresh={reload} />}
              {projectSubTab === "issues" && <IssuesPanel projectId={project.id} requirements={project.Requirement || []} onRefresh={reload} />}
              {projectSubTab === "repository" && <RepositoryPanel project={project} />}
              {projectSubTab === "deployments" && (
                <DeploymentsPanel
                  project={project}
                  hasProduct={hasProduct}
                  productId={productId}
                  productSlug={product?.slug || project?.Product?.[0]?.slug}
                />
              )}
            </div>
          </>
        )}
        {mainTab === "product" && product && (
          <>
            <VerticalTabNav tabs={enrichedProductTabs} activeTab={productSubTab} onTabChange={setProductSubTab} />
            <div className="flex-1 min-w-0">
              {productSubTab === "product-overview" && <ProductOverviewPanel product={product} onRefresh={() => loadProduct()} />}
              {productSubTab === "waitlist" && <WaitlistPanel productId={product.id} entries={product.WaitlistEntry || []} onRefresh={() => loadProduct()} />}
              {productSubTab === "changelog" && <ChangelogPanel productId={product.id} entries={product.ProductChangelog || []} onRefresh={() => loadProduct()} />}
              {productSubTab === "marketing" && <MarketingPanel product={product} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
