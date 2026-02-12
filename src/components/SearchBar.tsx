"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Lightbulb, FolderKanban, X, Loader2 } from "lucide-react";

interface SearchResult {
  ideas: {
    id: string;
    title: string;
    description: string;
    status: string;
    aiScore: number | null;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    status: string;
  }[];
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = useCallback((type: "idea" | "project", id: string) => {
    setIsOpen(false);
    setQuery("");
    if (type === "idea") {
      router.push(`/ideas/${id}`);
    } else {
      router.push(`/projects/${id}`);
    }
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PROMOTED":
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "IN_PROGRESS":
      case "VALIDATING":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const hasResults = results && (results.ideas.length > 0 || results.projects.length > 0);
  const noResults = results && results.ideas.length === 0 && results.projects.length === 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search... (⌘K)"
          className="pl-10 pr-10 py-2 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 transition-colors text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          )}

          {!isLoading && noResults && (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
              No results found for "{query}"
            </div>
          )}

          {!isLoading && hasResults && (
            <>
              {results.ideas.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50">
                    Ideas
                  </div>
                  {results.ideas.map((idea) => (
                    <button
                      key={idea.id}
                      onClick={() => handleSelect("idea", idea.id)}
                      className="w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {idea.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {idea.description}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(idea.status)}`}>
                        {idea.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.projects.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50">
                    Projects
                  </div>
                  {results.projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleSelect("project", project.id)}
                      className="w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <FolderKanban className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {project.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {project.description}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace("_", " ")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
