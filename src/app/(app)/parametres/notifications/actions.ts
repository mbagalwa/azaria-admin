"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getToken } from "@/lib/auth";
import { updateNotifications } from "@/lib/settings";

const PATH = "/parametres/notifications";

export type SettingsFormState = { ok?: boolean; error?: string };

export async function saveNotificationsAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const token = await getToken();
  if (!token) redirect("/login");

  const on = (k: string) => formData.get(k) != null;
  const text = (k: string) => String(formData.get(k) ?? "").trim() || null;

  const body = {
    emailEnabled: on("emailEnabled"),
    whatsappEnabled: on("whatsappEnabled"),
    senderEmail: text("senderEmail"),
    whatsappNumber: text("whatsappNumber"),
    notifyNewOrder: on("notifyNewOrder"),
    notifyStatusChange: on("notifyStatusChange"),
  };

  const res = await updateNotifications(body, token);
  if (!res.ok) return { error: res.message };

  revalidatePath(PATH);
  return { ok: true };
}
