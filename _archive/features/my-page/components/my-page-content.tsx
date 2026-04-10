"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/features/my-page/components/profile-card";
import { SettingsMenu } from "@/features/my-page/components/settings-menu";
import { ProfileEditSheet } from "@/features/my-page/components/profile-edit-sheet";
import { EmailChangeSheet } from "@/features/my-page/components/email-change-sheet";
import { NotificationSettingsSheet } from "@/features/my-page/components/notification-settings-sheet";
import { LogoutDialog } from "@/features/my-page/components/logout-dialog";
import { logout } from "@/features/auth/actions/auth-actions";
import type { UserProfile } from "@/types";

type ModalState = "none" | "profile" | "email" | "notification" | "logout";

type MyPageContentProps = {
  profile: UserProfile;
};

export function MyPageContent({ profile }: MyPageContentProps) {
  const [modal, setModal] = useState<ModalState>("none");

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="animate-fade-in px-4 pt-4">
      <PageHeader title="マイページ" subtitle="アカウント設定と管理" />

      <div className="mt-5">
        <ProfileCard
          profile={profile}
          onSettingsClick={() => setModal("profile")}
        />
      </div>

      <div className="mt-5">
        <SettingsMenu
          onProfileClick={() => setModal("profile")}
          onEmailClick={() => setModal("email")}
          onNotificationClick={() => setModal("notification")}
          email={profile.email}
        />
      </div>

      <div className="mt-5">
        <Button
          variant="ghost"
          fullWidth
          className="border border-line text-rose hover:bg-rose/5"
          onClick={() => setModal("logout")}
        >
          <LogOut size={16} />
          ログアウト
        </Button>
      </div>

      <div className="h-8" />

      <ProfileEditSheet
        isOpen={modal === "profile"}
        onClose={() => setModal("none")}
        initialName={profile.display_name}
        initialPhone={profile.phone || ""}
      />

      <EmailChangeSheet
        isOpen={modal === "email"}
        onClose={() => setModal("none")}
        currentEmail={profile.email}
      />

      <NotificationSettingsSheet
        isOpen={modal === "notification"}
        onClose={() => setModal("none")}
        initialSettings={{
          order_updates: profile.notification_order_updates,
          earnings: profile.notification_earnings,
          promotions: profile.notification_promotions,
          email: profile.notification_email,
        }}
      />

      <LogoutDialog
        isOpen={modal === "logout"}
        onClose={() => setModal("none")}
        onLogout={handleLogout}
      />
    </div>
  );
}
