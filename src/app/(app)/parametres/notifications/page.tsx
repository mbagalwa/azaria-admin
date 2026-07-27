import { Suspense } from "react";
import { NotificationsForm } from "@/components/admin/notifications-form";
import { SettingsFormSkeleton } from "@/components/admin/settings-form-skeleton";
import { getToken } from "@/lib/auth";
import { getSettings, type NotificationsSettings } from "@/lib/settings";

export const metadata = { title: "Notifications" };

const FALLBACK: NotificationsSettings = {
  emailEnabled: false,
  whatsappEnabled: false,
  senderEmail: null,
  whatsappNumber: null,
  notifyNewOrder: true,
  notifyStatusChange: true,
};

export default function ParametresNotificationsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Notifications
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Canaux (email, WhatsApp) et déclencheurs des messages.
        </p>
      </div>

      <Suspense fallback={<SettingsFormSkeleton rows={4} />}>
        <NotificationsLoader />
      </Suspense>
    </div>
  );
}

async function NotificationsLoader() {
  const token = await getToken();
  const res = token ? await getSettings(token) : null;
  const settings = res?.ok ? res.data.notifications : FALLBACK;
  const error = res && !res.ok ? res.message : null;

  return (
    <>
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <NotificationsForm settings={settings} />
    </>
  );
}
