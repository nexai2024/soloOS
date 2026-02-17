"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  milestones: Array<{ id: string; title: string; dueDate?: string | null }>;
  features: Array<{ id: string; title: string }>;
  tasks: Array<{ id: string; title: string; status?: string | null }>;
  ProjectDoc: Array<{ id: string; title: string; type?: string | null }>;
  Product?: Array<{ id: string; name: string; slug: string }>;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  isPublic?: boolean | null;
  showProgress?: boolean | null;
  showPhases?: boolean | null;
  showTasks?: boolean | null;
  showChangelog?: boolean | null;
  WaitlistEntry: Array<{
    id: string;
    email: string;
    message?: string | null;
    status: string;
  }>;
  ProductChangelog: Array<{
    id: string;
    version: string;
    title: string;
    content: string;
    type: string;
    releasedAt: string;
  }>;
  DevelopmentPhase: Array<{
    id: string;
    name: string;
    status?: string | null;
    PhaseTask: Array<{
      id: string;
      title: string;
      status?: string | null;
    }>;
  }>;
};

const projectStatuses = [
  "PLANNING",
  "BUILDING",
  "TESTING",
  "DEPLOYED",
  "PAUSED",
  "COMPLETED",
  "ARCHIVED",
];

const waitlistStatuses = ["PENDING", "INVITED", "CONVERTED", "ARCHIVED"];

const taskStatuses = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

export default function ProjectDetailPage() {
  const router = useRouter();
  const routeParams = useParams<{ id?: string }>();
  const [tab, setTab] = useState<"project" | "product">("project");
  const [project, setProject] = useState<Project | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const projectId = routeParams?.id;
  const productId = useMemo(() => project?.Product?.[0]?.id ?? null, [project]);

  const [projectDraft, setProjectDraft] = useState({
    title: "",
    description: "",
    status: "PLANNING",
  });

  const [productDraft, setProductDraft] = useState({
    name: "",
    tagline: "",
    description: "",
    isPublic: false,
    showProgress: true,
    showPhases: true,
    showTasks: true,
    showChangelog: true,
  });

  const [newChangelog, setNewChangelog] = useState({
    version: "",
    title: "",
    content: "",
    type: "RELEASE",
  });

  const [newPhase, setNewPhase] = useState({ name: "", status: "PLANNING" });
  const [newTaskByPhase, setNewTaskByPhase] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const load = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const projectRes = await fetch(`/api/projects/${projectId}`);
        if (projectRes.status === 401) {
          router.push("/login");
          return;
        }
        if (!projectRes.ok) throw new Error("Failed to load project");
        const projectData = (await projectRes.json()) as Project;
        setProject(projectData);
        setProjectDraft({
          title: projectData.title ?? "",
          description: projectData.description ?? "",
          status: projectData.status ?? "PLANNING",
        });

        const linkedProductId = projectData.Product?.[0]?.id;
        if (linkedProductId) {
          const productRes = await fetch(`/api/products/${linkedProductId}`);
          if (productRes.ok) {
            const productData = (await productRes.json()) as Product;
            setProduct(productData);
            setProductDraft({
              name: productData.name ?? "",
              tagline: productData.tagline ?? "",
              description: productData.description ?? "",
              isPublic: Boolean(productData.isPublic),
              showProgress: Boolean(productData.showProgress ?? true),
              showPhases: Boolean(productData.showPhases ?? true),
              showTasks: Boolean(productData.showTasks ?? true),
              showChangelog: Boolean(productData.showChangelog ?? true),
            });
          }
        }
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, router]);

  const reloadProduct = async () => {
    if (!productId) return;
    const productRes = await fetch(`/api/products/${productId}`);
    if (productRes.ok) {
      const productData = (await productRes.json()) as Product;
      setProduct(productData);
    }
  };

  const saveProject = async () => {
    setSaving(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectDraft),
      });
      if (!res.ok) throw new Error("Failed to save project");
      const updated = (await res.json()) as Project;
      setProject(updated);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to save project"
      );
    } finally {
      setSaving(false);
    }
  };

  const saveProduct = async () => {
    if (!productId) return;
    setSaving(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productDraft),
      });
      if (!res.ok) throw new Error("Failed to save product");
      await reloadProduct();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  };

  const updateWaitlist = async (entryId: string, status: string) => {
    if (!productId) return;
    setActionError(null);
    await fetch(`/api/products/${productId}/waitlist/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await reloadProduct();
  };

  const addChangelog = async () => {
    if (!productId) return;
    setActionError(null);
    if (!newChangelog.version || !newChangelog.title || !newChangelog.content) {
      setActionError("Version, title, and content are required for changelog.");
      return;
    }
    await fetch(`/api/products/${productId}/changelog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newChangelog),
    });
    setNewChangelog({ version: "", title: "", content: "", type: "RELEASE" });
    await reloadProduct();
  };

  const updateChangelog = async (
    entryId: string,
    updates: Partial<Product["ProductChangelog"][number]>
  ) => {
    if (!productId) return;
    setActionError(null);
    await fetch(`/api/products/${productId}/changelog/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    await reloadProduct();
  };

  const addPhase = async () => {
    if (!productId || !newPhase.name) return;
    setActionError(null);
    await fetch(`/api/products/${productId}/phases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPhase),
    });
    setNewPhase({ name: "", status: "PLANNING" });
    await reloadProduct();
  };

  const addTask = async (phaseId: string) => {
    if (!productId || !newTaskByPhase[phaseId]) return;
    setActionError(null);
    await fetch(`/api/products/${productId}/phases/${phaseId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTaskByPhase[phaseId] }),
    });
    setNewTaskByPhase((prev) => ({ ...prev, [phaseId]: "" }));
    await reloadProduct();
  };

  const updateTaskStatus = async (
    phaseId: string,
    taskId: string,
    status: string
  ) => {
    if (!productId) return;
    setActionError(null);
    await fetch(
      `/api/products/${productId}/phases/${phaseId}/tasks/${taskId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    await reloadProduct();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-slate-500">Loading project…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-6xl mx-auto p-8 space-y-4">
        <Link
          href="/projects"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Projects
        </Link>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {loadError}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-slate-500">Project not found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Projects
        </Link>
        {productId && (
          <Link
            href={`/products/${productId}`}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            View product page
          </Link>
        )}
      </div>

      {actionError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {actionError}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {project.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {project.description}
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
            {project.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1 w-fit">
        <button
          className={`px-4 py-2 text-sm rounded-full ${
            tab === "project"
              ? "bg-white shadow text-slate-900"
              : "text-slate-600"
          }`}
          onClick={() => setTab("project")}
        >
          Project
        </button>
        <button
          className={`px-4 py-2 text-sm rounded-full ${
            tab === "product"
              ? "bg-white shadow text-slate-900"
              : "text-slate-600"
          }`}
          onClick={() => setTab("product")}
        >
          Product
        </button>
      </div>

      {tab === "project" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Project details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase text-slate-500">
                  Title
                </label>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={projectDraft.title}
                  onChange={(event) =>
                    setProjectDraft((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs uppercase text-slate-500">
                  Status
                </label>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={projectDraft.status}
                  onChange={(event) =>
                    setProjectDraft((prev) => ({
                      ...prev,
                      status: event.target.value,
                    }))
                  }
                >
                  {projectStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500">
                Description
              </label>
              <textarea
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                rows={4}
                value={projectDraft.description}
                onChange={(event) =>
                  setProjectDraft((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-60"
                onClick={saveProject}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save project"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="text-xs uppercase text-slate-500">Milestones</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {project.milestones?.length}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="text-xs uppercase text-slate-500">Features</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {project.features?.length}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="text-xs uppercase text-slate-500">Tasks</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {project.tasks?.length}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="text-xs uppercase text-slate-500">Docs</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {project.ProjectDoc?.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "product" && (
        <div className="space-y-6">
          {!product ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-slate-600">
              No linked product yet.
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Product details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase text-slate-500">
                      Name
                    </label>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      value={productDraft.name}
                      onChange={(event) =>
                        setProductDraft((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-slate-500">
                      Tagline
                    </label>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      value={productDraft.tagline}
                      onChange={(event) =>
                        setProductDraft((prev) => ({
                          ...prev,
                          tagline: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase text-slate-500">
                    Description
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    rows={4}
                    value={productDraft.description}
                    onChange={(event) =>
                      setProductDraft((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  {[
                    { key: "isPublic", label: "Public" },
                    { key: "showProgress", label: "Show progress" },
                    { key: "showPhases", label: "Show phases" },
                    { key: "showTasks", label: "Show tasks" },
                    { key: "showChangelog", label: "Show changelog" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <input
                        type="checkbox"
                        checked={
                          productDraft[item.key as keyof typeof productDraft] as boolean
                        }
                        onChange={(event) =>
                          setProductDraft((prev) => ({
                            ...prev,
                            [item.key]: event.target.checked,
                          }))
                        }
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-60"
                    onClick={saveProduct}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save product"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
                  <div className="text-xs uppercase text-slate-500">Waitlist</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {product.WaitlistEntry.length}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
                  <div className="text-xs uppercase text-slate-500">Changelog</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {product.ProductChangelog.length}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
                  <div className="text-xs uppercase text-slate-500">Dev Phases</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {product.DevelopmentPhase.length}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Waitlist entries
                </h3>
                <div className="space-y-3">
                  {product.WaitlistEntry.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {entry.email}
                        </div>
                        {entry.message && (
                          <div className="text-xs text-slate-500">
                            {entry.message}
                          </div>
                        )}
                      </div>
                      <select
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                        value={entry.status}
                        onChange={(event) =>
                          updateWaitlist(entry.id, event.target.value)
                        }
                      >
                        {waitlistStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {product.WaitlistEntry.length === 0 && (
                    <div className="text-sm text-slate-500">
                      No waitlist entries yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Changelog
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Version"
                    value={newChangelog.version}
                    onChange={(event) =>
                      setNewChangelog((prev) => ({
                        ...prev,
                        version: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Title"
                    value={newChangelog.title}
                    onChange={(event) =>
                      setNewChangelog((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Type"
                    value={newChangelog.type}
                    onChange={(event) =>
                      setNewChangelog((prev) => ({
                        ...prev,
                        type: event.target.value,
                      }))
                    }
                  />
                  <button
                    className="rounded-lg bg-slate-900 text-white text-sm"
                    onClick={addChangelog}
                  >
                    Add entry
                  </button>
                </div>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Changelog content"
                  value={newChangelog.content}
                  onChange={(event) =>
                    setNewChangelog((prev) => ({
                      ...prev,
                      content: event.target.value,
                    }))
                  }
                />
                <div className="space-y-3">
                  {product.ProductChangelog.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-slate-200 p-3 space-y-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                          defaultValue={entry.version}
                          onBlur={(event) =>
                            updateChangelog(entry.id, {
                              version: event.target.value,
                            })
                          }
                        />
                        <input
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                          defaultValue={entry.title}
                          onBlur={(event) =>
                            updateChangelog(entry.id, {
                              title: event.target.value,
                            })
                          }
                        />
                        <input
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                          defaultValue={entry.type}
                          onBlur={(event) =>
                            updateChangelog(entry.id, {
                              type: event.target.value,
                            })
                          }
                        />
                      </div>
                      <textarea
                        className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs"
                        defaultValue={entry.content}
                        rows={2}
                        onBlur={(event) =>
                          updateChangelog(entry.id, {
                            content: event.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                  {product.ProductChangelog.length === 0 && (
                    <div className="text-sm text-slate-500">
                      No changelog entries yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Development phases
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Phase name"
                    value={newPhase.name}
                    onChange={(event) =>
                      setNewPhase((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Status"
                    value={newPhase.status}
                    onChange={(event) =>
                      setNewPhase((prev) => ({
                        ...prev,
                        status: event.target.value,
                      }))
                    }
                  />
                  <button
                    className="rounded-lg bg-slate-900 text-white text-sm"
                    onClick={addPhase}
                  >
                    Add phase
                  </button>
                </div>
                <div className="space-y-4">
                  {product.DevelopmentPhase.map((phase) => (
                    <div
                      key={phase.id}
                      className="rounded-lg border border-slate-200 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900">
                          {phase.name}
                        </div>
                        <span className="text-xs text-slate-500">
                          {phase.PhaseTask.length} tasks
                        </span>
                      </div>
                      <div className="space-y-2">
                        {phase.PhaseTask.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between rounded-md border border-slate-200 px-2 py-1 text-xs"
                          >
                            <span>{task.title}</span>
                            <select
                              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                              value={task.status ?? "TODO"}
                              onChange={(event) =>
                                updateTaskStatus(
                                  phase.id,
                                  task.id,
                                  event.target.value
                                )
                              }
                            >
                              {taskStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                        {phase.PhaseTask.length === 0 && (
                          <div className="text-xs text-slate-500">
                            No tasks yet.
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
                          placeholder="New task title"
                          value={newTaskByPhase[phase.id] ?? ""}
                          onChange={(event) =>
                            setNewTaskByPhase((prev) => ({
                              ...prev,
                              [phase.id]: event.target.value,
                            }))
                          }
                        />
                        <button
                          className="rounded-md bg-slate-900 text-white text-xs px-3 py-1"
                          onClick={() => addTask(phase.id)}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                  {product.DevelopmentPhase.length === 0 && (
                    <div className="text-sm text-slate-500">
                      No development phases yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
