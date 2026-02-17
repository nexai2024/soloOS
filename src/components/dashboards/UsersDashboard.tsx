'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  MessageSquare,
  Plus,
  Star,
  Loader2,
  Sparkles,
  UserPlus,
  Mail
} from 'lucide-react';
import { EmptyState } from '../onboarding/EmptyState';
import { fetchGet, fetchPost } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';

interface Contact {
  id: string;
  email: string;
  lifecycleStage: string;
  planStatus: string | null;
  score: number;
  tags: string[];
  Feedback: Array<{ id: string; type: string; status: string }>;
  ContactEvent: Array<{ id: string; type: string; occurredAt: string }>;
}

interface Feedback {
  id: string;
  type: string;
  content: string;
  priority: number;
  status: string;
  createdAt: string;
  Contact: { id: string; email: string; lifecycleStage: string };
}

export default function UsersDashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    productName: '',
    targetAudience: '',
    count: 5,
  });
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [contactsResult, feedbackResult] = await Promise.all([
      fetchGet<Contact[]>('/api/contacts'),
      fetchGet<Feedback[]>('/api/feedback'),
    ]);

    if (contactsResult.status === 401 || feedbackResult.status === 401) {
      router.push('/');
      return;
    }

    if (contactsResult.ok) setContacts(contactsResult.data);
    if (feedbackResult.ok) setFeedback(feedbackResult.data);

    const firstError = [contactsResult, feedbackResult].find(r => !r.ok);
    if (firstError && !firstError.ok) {
      setError(firstError.error);
      toast.error(firstError.error);
    }

    setIsLoading(false);
  };

  const handleGenerateContacts = async () => {
    if (!generateForm.productName || !generateForm.targetAudience) return;

    setIsGenerating(true);
    const result = await fetchPost<{ contacts: Contact[] }>('/api/contacts/generate', generateForm);

    if (result.ok) {
      setContacts(prev => [...result.data.contacts, ...prev]);
      setShowGenerateModal(false);
      setGenerateForm({ productName: '', targetAudience: '', count: 5 });
      toast.success('Contacts generated');
    } else {
      setError(result.error);
      toast.error(result.error);
    }
    setIsGenerating(false);
  };

  const getLifecycleColor = (stage: string) => {
    switch (stage.toUpperCase()) {
      case 'CUSTOMER':
      case 'CHAMPION':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'QUALIFIED':
      case 'OPPORTUNITY':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'LEAD':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
      case 'CHURNED':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  const getFeedbackTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'feature-request':
      case 'feature':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'bug':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      case 'enhancement':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'praise':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={() => { setError(null); setIsLoading(true); fetchData(); }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasNoData = contacts.length === 0;

  if (hasNoData) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Users}
          title="Build Your User Base"
          description="Track contacts, gather feedback, and understand your users. Use AI to generate sample contacts for testing your workflows."
          actionLabel="Generate Sample Contacts"
          onAction={() => setShowGenerateModal(true)}
          tips={[
            "Add contacts manually or import from your product",
            "Use AI to generate realistic sample data for testing",
            "Track lifecycle stages from lead to champion",
            "Collect and prioritize user feedback"
          ]}
        />

        {showGenerateModal && (
          <GenerateContactsModal
            form={generateForm}
            setForm={setGenerateForm}
            isGenerating={isGenerating}
            onGenerate={handleGenerateContacts}
            onClose={() => setShowGenerateModal(false)}
          />
        )}
      </div>
    );
  }

  // Calculate metrics from real data
  const totalContacts = contacts.length;
  const customers = contacts.filter(c => c.lifecycleStage === 'CUSTOMER' || c.lifecycleStage === 'CHAMPION').length;
  const leads = contacts.filter(c => c.lifecycleStage === 'LEAD').length;
  const avgScore = contacts.length > 0
    ? Math.round(contacts.reduce((sum, c) => sum + c.score, 0) / contacts.length)
    : 0;

  // Group contacts by lifecycle stage for breakdown
  const lifecycleBreakdown = [
    { stage: 'Lead', count: contacts.filter(c => c.lifecycleStage === 'LEAD').length },
    { stage: 'Qualified', count: contacts.filter(c => c.lifecycleStage === 'QUALIFIED').length },
    { stage: 'Customer', count: contacts.filter(c => c.lifecycleStage === 'CUSTOMER').length },
    { stage: 'Champion', count: contacts.filter(c => c.lifecycleStage === 'CHAMPION').length },
  ].filter(s => s.count > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Users & Contacts
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Know your users like a human, not a spreadsheet
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Generate
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg">
            <Plus className="h-5 w-5 mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {totalContacts}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total Contacts
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {customers}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Customers
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <UserPlus className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {leads}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Leads
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {feedback.length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Feedback Items
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contacts</h3>
            <span className="text-sm text-slate-500">{contacts.length} total</span>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
            {contacts.slice(0, 10).map((contact) => (
              <div
                key={contact.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {contact.email}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {contact.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLifecycleColor(contact.lifecycleStage)}`}>
                      {contact.lifecycleStage.toLowerCase()}
                    </span>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Score: {contact.score}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lifecycle Breakdown</h3>
          </div>
          <div className="p-6 space-y-6">
            {lifecycleBreakdown.map((item, index) => {
              const percentage = totalContacts > 0 ? Math.round((item.count / totalContacts) * 100) : 0;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900 dark:text-white">{item.stage}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {item.count} contacts
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {feedback.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Feedback</h3>
            <MessageSquare className="h-5 w-5 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {feedback.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.Contact.email.split('@')[0]}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFeedbackTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.content}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'OPEN'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                        : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    }`}>
                      {item.status.toLowerCase()}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {formatTimeAgo(item.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showGenerateModal && (
        <GenerateContactsModal
          form={generateForm}
          setForm={setGenerateForm}
          isGenerating={isGenerating}
          onGenerate={handleGenerateContacts}
          onClose={() => setShowGenerateModal(false)}
        />
      )}
    </div>
  );
}

function GenerateContactsModal({
  form,
  setForm,
  isGenerating,
  onGenerate,
  onClose,
}: {
  form: { productName: string; targetAudience: string; count: number };
  setForm: (form: { productName: string; targetAudience: string; count: number }) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Generate Sample Contacts
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., SoloOS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Target Audience
            </label>
            <textarea
              value={form.targetAudience}
              onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              rows={3}
              placeholder="Describe your target audience (e.g., indie developers, SaaS founders, solopreneurs)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Number of Contacts
            </label>
            <select
              value={form.count}
              onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value={3}>3 contacts</option>
              <option value={5}>5 contacts</option>
              <option value={10}>10 contacts</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onGenerate}
            disabled={isGenerating || !form.productName || !form.targetAudience}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
