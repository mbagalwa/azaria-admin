import { Suspense } from "react";
import { RestaurantForm } from "@/components/admin/restaurant-form";
import { SettingsFormSkeleton } from "@/components/admin/settings-form-skeleton";
import { getToken } from "@/lib/auth";
import { getSettings, type RestaurantSettings } from "@/lib/settings";

export const metadata = { title: "Restaurant" };

const FALLBACK: RestaurantSettings = {
  currency: "USD",
  phone: null,
  whatsapp: null,
  email: null,
  address: null,
  city: null,
  hours: null,
  deliveryFeeCents: 200,
  orderCutoff: "09:00",
  services: [],
};

export default function ParametresRestaurantPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Restaurant
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Coordonnées, horaires, devise et heures limites de commande.
        </p>
      </div>

      <Suspense fallback={<SettingsFormSkeleton rows={6} />}>
        <RestaurantLoader />
      </Suspense>
    </div>
  );
}

async function RestaurantLoader() {
  const token = await getToken();
  const res = token ? await getSettings(token) : null;
  const settings = res?.ok ? res.data.restaurant : FALLBACK;
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
      <RestaurantForm settings={settings} />
    </>
  );
}
