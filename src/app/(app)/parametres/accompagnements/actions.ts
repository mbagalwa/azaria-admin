"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getToken } from "@/lib/auth";
import {
  createAccompaniment,
  deleteAccompaniment,
  updateAccompaniment,
} from "@/lib/accompaniments";

const LIST_PATH = "/parametres/accompagnements";

export type AccompanimentFormValues = {
  name: string;
  description: string;
  price: string;
  isAvailable: boolean;
};

export type AccompanimentFormState = {
  error?: string;
  /** Passe à `true` quand l'enregistrement a réussi (le modal se referme). */
  ok?: boolean;
  values?: AccompanimentFormValues;
};

type Built =
  | { fd: FormData; values: AccompanimentFormValues }
  | { error: string; values: AccompanimentFormValues };

/**
 * Lit le formulaire du navigateur et reconstruit un FormData pour l'API :
 * supplément converti dollars → centimes (vide = 0, donc inclus).
 */
function buildApiFormData(formData: FormData): Built {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const isAvailable = formData.get("isAvailable") != null;
  const values: AccompanimentFormValues = { name, description, price, isAvailable };

  if (name.length < 2) {
    return { error: "Le nom doit faire au moins 2 caractères.", values };
  }
  const parsed = price === "" ? 0 : Number.parseFloat(price.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { error: "Le supplément est invalide.", values };
  }

  const fd = new FormData();
  fd.set("name", name);
  fd.set("description", description);
  fd.set("priceCents", String(Math.round(parsed * 100)));
  fd.set("isAvailable", isAvailable ? "true" : "false");

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    fd.set("image", image, image.name);
  }

  return { fd, values };
}

export async function createAccompanimentAction(
  _prev: AccompanimentFormState,
  formData: FormData,
): Promise<AccompanimentFormState> {
  const token = await getToken();
  if (!token) redirect("/login");

  const built = buildApiFormData(formData);
  if ("error" in built) return { error: built.error, values: built.values };

  const res = await createAccompaniment(built.fd, token);
  if (!res.ok) return { error: res.message, values: built.values };

  revalidatePath(LIST_PATH);
  return { ok: true };
}

export async function updateAccompanimentAction(
  id: number,
  _prev: AccompanimentFormState,
  formData: FormData,
): Promise<AccompanimentFormState> {
  const token = await getToken();
  if (!token) redirect("/login");

  const built = buildApiFormData(formData);
  if ("error" in built) return { error: built.error, values: built.values };

  const res = await updateAccompaniment(id, built.fd, token);
  if (!res.ok) return { error: res.message, values: built.values };

  revalidatePath(LIST_PATH);
  return { ok: true };
}

export async function deleteAccompanimentAction(id: number) {
  const token = await getToken();
  if (!token) redirect("/login");

  const res = await deleteAccompaniment(id, token);
  if (!res.ok) return { error: res.message };

  revalidatePath(LIST_PATH);
}
