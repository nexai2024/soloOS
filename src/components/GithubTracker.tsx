"use client";

import React, { useState, useEffect } from 'react';
import { 
  Github, Star, GitFork, AlertCircle, GitCommit, 
  GitPullRequest, Activity, Download, Search, 
  CheckCircle2, XCircle, Clock, ExternalLink, Code
} from 'lucide-react';

// TypeScript Interfaces
export interface GitHubTrackerProps {
  initialOwner?: string;
  initialRepo?: string;
  personalAccessToken?: string;
}

export interface RepoInfo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  open_issues_count: number;
  created_at: string;
  pushed_at: string;
  default_branch: string;
  license: { name: string } | null;
}

export interface Commit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    avatar_url: string;
  } | null;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  comments: number;
  user: {
    login: string;
  };
  pull_request?: unknown;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  merged_at: string | null;
  user: {
    login: string;
  };
}

export interface DataState {
  repoInfo: RepoInfo | null;
  commits: Commit[];
  issues: Issue[];
  pullRequests: PullRequest[];
}

// Main Reusable Component
export const GitHubTracker: React.FC<GitHubTrackerProps> = ({ 
  initialOwner = 'vercel', 
  initialRepo = 'next.js',
  personalAccessToken = '' 
}) => {
  const [target, setTarget] = useState<string>(`${initialOwner}/${initialRepo}`);
  const [owner, setOwner] = useState<string>(initialOwner);
  const [repo, setRepo] = useState<string>(initialRepo);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const [data, setData] = useState<DataState>({
    repoInfo: null,
    commits: [],
    issues: [],
    pullRequests: []
  });

  const fetchGitHubData = async (currentOwner: string, currentRepo: string) => {
    setLoading(true);
    setError(null);
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (personalAccessToken) {
      headers['Authorization'] = `token ${personalAccessToken}`;
    }

    const baseUrl = `https://api.github.com/repos/${currentOwner}/${currentRepo}`;

    try {
      const [repoRes, commitsRes, issuesRes, pullsRes] = await Promise.all([
        fetch(baseUrl, { headers }),
        fetch(`${baseUrl}/commits?per_page=15`, { headers }),
        fetch(`${baseUrl}/issues?state=all&per_page=15`, { headers }),
        fetch(`${baseUrl}/pulls?state=all&per_page=15`, { headers })
      ]);

      if (!repoRes.ok) {
        if (repoRes.status === 404) throw new Error('Repository not found. Check the spelling.');
        if (repoRes.status === 403) throw new Error('GitHub API rate limit exceeded. Try again later or provide a Personal Access Token.');
        throw new Error(`Failed to fetch: ${repoRes.statusText}`);
      }

      const repoInfo: RepoInfo = await repoRes.json();
      const commits: Commit[] = commitsRes.ok ? await commitsRes.json() : [];
      const allIssues: Issue[] = issuesRes.ok ? await issuesRes.json() : [];
      const pullRequests: PullRequest[] = pullsRes.ok ? await pullsRes.json() : [];

      // Filter out PRs from the issues endpoint
      const pureIssues = allIssues.filter(issue => !issue.pull_request);

      setData({
        repoInfo,
        commits,
        issues: pureIssues,
        pullRequests
      });

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubData(owner, repo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, repo]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parts = target.split('/');
    if (parts.length === 2) {
      setOwner(parts[0].trim());
      setRepo(parts[1].trim());
    } else {
      setError("Please format the search as 'owner/repo' (e.g., 'facebook/react')");
    }
  };

  const exportToJson = () => {
    if (!data.repoInfo) return;

    const exportPayload = {
      timestamp: new Date().toISOString(),
      repository: {
        name: data.repoInfo.name,
        fullName: data.repoInfo.full_name,
        description: data.repoInfo.description,
        url: data.repoInfo.html_url,
        stars: data.repoInfo.stargazers_count,
        forks: data.repoInfo.forks_count,
        language: data.repoInfo.language,
      },
      recentCommits: data.commits.map(c => ({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author.name,
        date: c.commit.author.date,
        url: c.html_url
      })),
      recentIssues: data.issues.map(i => ({
        number: i.number,
        title: i.title,
        state: i.state,
        author: i.user.login,
        createdAt: i.created_at,
        url: i.html_url
      })),
      recentPullRequests: data.pullRequests.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        author: pr.user.login,
        createdAt: pr.created_at,
        url: pr.html_url
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${owner}-${repo}-tracker-data.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'commits', label: `Commits (${data.commits.length})`, icon: GitCommit },
    { id: 'issues', label: `Issues (${data.issues.length})`, icon: AlertCircle },
    { id: 'prs', label: `Pull Requests (${data.pullRequests.length})`, icon: GitPullRequest },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      {/* Header & Search */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 rounded-lg">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">Repo Tracker</h2>
            <p className="text-sm text-slate-500">Monitor GitHub activity</p>
          </div>
        </div>

        <div className="flex w-full md:w-auto items-center gap-2">
          <form onSubmit={handleSearch} className="flex w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="owner/repo"
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
            <button 
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors"
            >
              Track
            </button>
          </form>
          
          <button 
            onClick={exportToJson}
            disabled={loading || !data.repoInfo}
            className="p-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 group relative"
            title="Export payload as well-formed JSON"
          >
            <Download className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium">Fetching repository data...</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && data.repoInfo && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-slate-100">
            <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.repoInfo.stargazers_count?.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Stars</div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
              <GitFork className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.repoInfo.forks_count?.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Forks</div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-emerald-500" />
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.repoInfo.open_issues_count?.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Open Issues</div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
              <Code className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.repoInfo.language || 'N/A'}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Primary Lang</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex px-6 border-b border-slate-200 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-slate-50/50 min-h-[400px]">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="max-w-3xl">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <a href={data.repoInfo.html_url} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors flex items-center gap-2">
                    {data.repoInfo.full_name}
                    <ExternalLink className="w-5 h-5 text-slate-400" />
                  </a>
                </h3>
                <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                  {data.repoInfo.description || 'No description provided for this repository.'}
                </p>
                
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
                  <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">Repository Details</h4>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="text-slate-500">Created At</div>
                    <div className="font-medium text-slate-900">{new Date(data.repoInfo.created_at).toLocaleDateString()}</div>
                    
                    <div className="text-slate-500">Last Pushed</div>
                    <div className="font-medium text-slate-900">{new Date(data.repoInfo.pushed_at).toLocaleString()}</div>
                    
                    <div className="text-slate-500">Default Branch</div>
                    <div className="font-medium text-slate-900 flex items-center gap-1">
                      <GitCommit className="w-3 h-3" /> {data.repoInfo.default_branch}
                    </div>
                    
                    <div className="text-slate-500">License</div>
                    <div className="font-medium text-slate-900">{data.repoInfo.license?.name || 'None'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* COMMITS TAB */}
            {activeTab === 'commits' && (
              <div className="space-y-4">
                {data.commits.map((commit) => (
                  <div key={commit.sha} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-blue-200 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <a href={commit.html_url} target="_blank" rel="noreferrer" className="text-slate-900 font-semibold text-sm hover:text-blue-600 truncate block">
                          {commit.commit.message.split('\n')[0]}
                        </a>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <img 
                            src={commit.author?.avatar_url || `https://ui-avatars.com/api/?name=${commit.commit.author.name}`} 
                            alt={commit.commit.author.name} 
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="font-medium text-slate-700">{commit.commit.author.name}</span>
                          <span>committed on {new Date(commit.commit.author.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2 text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        <GitCommit className="w-3 h-3" />
                        {commit.sha.substring(0, 7)}
                      </div>
                    </div>
                  </div>
                ))}
                {data.commits.length === 0 && <p className="text-slate-500 text-center py-8">No recent commits found.</p>}
              </div>
            )}

            {/* ISSUES TAB */}
            {activeTab === 'issues' && (
              <div className="space-y-4">
                {data.issues.map((issue) => (
                  <div key={issue.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-emerald-200 transition-colors">
                    <div className="flex items-start gap-3">
                      {issue.state === 'open' ? (
                        <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <a href={issue.html_url} target="_blank" rel="noreferrer" className="text-slate-900 font-semibold text-sm hover:text-emerald-600 line-clamp-2">
                          {issue.title}
                        </a>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">#{issue.number}</span>
                          <span>opened by {issue.user.login}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(issue.created_at).toLocaleDateString()}
                          </span>
                          {issue.comments > 0 && (
                            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                              {issue.comments} comments
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {data.issues.length === 0 && <p className="text-slate-500 text-center py-8">No recent issues found.</p>}
              </div>
            )}

            {/* PULL REQUESTS TAB */}
            {activeTab === 'prs' && (
              <div className="space-y-4">
                {data.pullRequests.map((pr) => (
                  <div key={pr.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-purple-200 transition-colors">
                    <div className="flex items-start gap-3">
                      {pr.state === 'open' ? (
                        <GitPullRequest className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : pr.merged_at ? (
                        <GitPullRequest className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <a href={pr.html_url} target="_blank" rel="noreferrer" className="text-slate-900 font-semibold text-sm hover:text-purple-600 line-clamp-2">
                          {pr.title}
                        </a>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">#{pr.number}</span>
                          <span>by {pr.user.login}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(pr.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {data.pullRequests.length === 0 && <p className="text-slate-500 text-center py-8">No recent pull requests found.</p>}
              </div>
            )}
            
          </div>
        </>
      )}
    </div>
  );
};
