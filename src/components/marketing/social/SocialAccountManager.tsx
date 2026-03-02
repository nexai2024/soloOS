'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Twitter,
  Linkedin,
  AtSign,
  Globe,
  Hash,
  Send,
  Loader2,
  Link2,
  Unlink2,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { fetchGet, fetchDelete } from '@/lib/fetch';
import { SOCIAL_PLATFORMS } from '@/lib/marketing/constants';
import type { SocialPlatform, SocialAccountData } from '@/lib/marketing/types';

function getPlatformIcon(platform: SocialPlatform, className: string = 'h-5 w-5') {
  switch (platform) {
    case 'TWITTER':
      return <Twitter className={className} />;
    case 'LINKEDIN':
      return <Linkedin className={className} />;
    case 'THREADS':
      return <AtSign className={className} />;
    case 'BLUESKY':
      return <Globe className={className} />;
    case 'MASTODON':
      return <Hash className={className} />;
    default:
      return <Send className={className} />;
  }
}

export default function SocialAccountManager() {
  const [accounts, setAccounts] = useState<SocialAccountData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [confirmDisconnectId, setConfirmDisconnectId] = useState<string | null>(null);
  const toast = useToast();

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchGet<SocialAccountData[]>('/api/social-accounts');
    if (result.ok) {
      setAccounts(result.data);
    } else {
      toast.error('Failed to load social accounts');
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleConnect = (platform: SocialPlatform) => {
    window.location.href = `/api/social-accounts/${platform.toLowerCase()}/connect`;
  };

  const handleDisconnect = async (account: SocialAccountData) => {
    setDisconnectingId(account.id);
    const result = await fetchDelete('/api/social-accounts/' + account.id);
    if (result.ok) {
      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
      toast.success(`Disconnected ${account.accountName}`);
    } else {
      toast.error('Failed to disconnect account');
    }
    setDisconnectingId(null);
    setConfirmDisconnectId(null);
  };

  const isTokenExpiringSoon = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isTokenExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getConnectedAccount = (platform: SocialPlatform): SocialAccountData | undefined => {
    return accounts.find((a) => a.platform === platform);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Connect your social media accounts to publish posts directly from SoloOS.
        </p>
        <button
          type="button"
          onClick={fetchAccounts}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          title="Refresh accounts"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3">
        {SOCIAL_PLATFORMS.map((platform) => {
          const account = getConnectedAccount(platform.key);
          const isConnected = account?.isConnected ?? false;
          const tokenExpired = account ? isTokenExpired(account.tokenExpiresAt) : false;
          const tokenExpiringSoon = account ? isTokenExpiringSoon(account.tokenExpiresAt) : false;
          const isDisconnecting = disconnectingId === account?.id;
          const showConfirm = confirmDisconnectId === account?.id;

          return (
            <div
              key={platform.key}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4"
            >
              {/* Platform icon */}
              <div
                className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: platform.color }}
              >
                {getPlatformIcon(platform.key)}
              </div>

              {/* Platform info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {platform.label}
                  </h3>
                  {isConnected && !tokenExpired && (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Connected
                      </span>
                    </span>
                  )}
                  {isConnected && tokenExpired && (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                        Token Expired
                      </span>
                    </span>
                  )}
                  {!isConnected && account && (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                        Disconnected
                      </span>
                    </span>
                  )}
                </div>

                {account ? (
                  <div className="mt-0.5">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {account.accountName}
                    </p>
                    {account.tokenExpiresAt && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span
                          className={`text-xs ${
                            tokenExpired
                              ? 'text-red-500 dark:text-red-400'
                              : tokenExpiringSoon
                              ? 'text-amber-500 dark:text-amber-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {tokenExpired
                            ? 'Token expired ' + new Date(account.tokenExpiresAt).toLocaleDateString()
                            : 'Expires ' + new Date(account.tokenExpiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {tokenExpiringSoon && !tokenExpired && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        <span className="text-xs text-amber-500 dark:text-amber-400">
                          Token expires soon - reconnect to refresh
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                    Not connected
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {account && isConnected && !tokenExpired ? (
                  <>
                    {showConfirm ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600 dark:text-red-400">Disconnect?</span>
                        <button
                          type="button"
                          onClick={() => handleDisconnect(account)}
                          disabled={isDisconnecting}
                          className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
                        >
                          {isDisconnecting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Confirm'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDisconnectId(null)}
                          className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDisconnectId(account.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-600 rounded-lg transition-colors"
                      >
                        <Unlink2 className="h-3.5 w-3.5" />
                        Disconnect
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnect(platform.key)}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white rounded-lg transition-colors shadow-sm"
                    style={{ backgroundColor: platform.color }}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    {account && (tokenExpired || !isConnected) ? 'Reconnect' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <CheckCircle2 className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {accounts.filter((a) => a.isConnected).length} of {SOCIAL_PLATFORMS.length} platforms connected
        </span>
      </div>
    </div>
  );
}
