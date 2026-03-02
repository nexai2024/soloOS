import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <UserProfile />
      </div>
    </div>
  );
}
