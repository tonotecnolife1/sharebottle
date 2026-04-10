import { User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";

type ProfileCardProps = {
  profile: UserProfile;
  onSettingsClick: () => void;
};

export function ProfileCard({ profile, onSettingsClick }: ProfileCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-card border border-line bg-bg-card p-4">
      {/* Avatar */}
      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/30 bg-bg-elevated">
          <User size={24} className="text-gold" />
        </div>
        <button
          onClick={() => {}}
          className="absolute -bottom-0.5 -left-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-bg-elevated text-text-muted"
          aria-label="アバターを変更"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"/>
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-body-lg font-bold truncate">{profile.display_name}</h2>
        <p className="text-body-sm text-text-muted truncate">{profile.email}</p>
        <p className="text-body-sm text-text-muted">{profile.phone}</p>
      </div>

      {/* Settings gear */}
      <button
        onClick={onSettingsClick}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          "border border-line bg-bg-elevated",
          "text-text-muted transition-colors hover:text-text-secondary"
        )}
      >
        <Settings size={16} />
      </button>
    </div>
  );
}
