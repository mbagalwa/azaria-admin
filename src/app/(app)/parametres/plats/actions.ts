"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getToken } from "@/lib/auth";
import { createDish, deleteDish, updateDish } from "@/lib/dishes";

const LIST_PATH = "/parametres/plats";

export type DishFormValues = {
  name: string;
  description: string;
  category: string;
  price: string;
  isAvailable: boolean;
};

export type DishFormState = {
  error?: string;
  values?: DishFormValues;
};

type BuiltFormData =
  | { fd: FormData; values: DishFormValues }
  | { error: string; values: DishFormValues };

/**
 * Lit le formulaire du navigateur, valide le minimum et reconstruit un
 * FormData propre pour l'API : prix converti dollars → centimes, disponibilité
 * normalisée, image transportée telle quelle si un fichier a été choisi.
 */
function buildApiFormData(formData: FormData): BuiltFormData {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const isAvailable = formData.get("isAvailable") != null;
  const values: DishFormValues = { name, description, category, price, isAvailable };

  if (name.length < 2) {
    return { error: "Le nom doit faire au moins 2 caractères.", values };
  }
  const parsed = Number.parseFloat(price.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { error: "Le prix est invalide.", values };
  }
  const priceCents = Math.round(parsed * 100);

  const fd = new FormData();
  fd.set("name", name);
  fd.set("description", description);
  fd.set("category", category);
  fd.set("priceCents", String(priceCents));
  fd.set("isAvailable", isAvailable ? "true" : "false");

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    fd.set("image", image, image.name);
  }

  return { fd, values };
}

export async function createDishAction(
  _prev: DishFormState,
  formData: FormData,
): Promise<DishFormState> {
  const token = await getToken();
  if (!token) redirect("/login");

  const built = buildApiFormData(formData);
  if ("error" in built) return { error: built.error, values: built.values };

  const res = await createDish(built.fd, token);
  if (!res.ok) return { error: res.message, values: built.values };

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function updateDishAction(
  id: number,
  _prev: DishFormState,
  formData: FormData,
): Promise<DishFormState> {
  const token = await getToken();
  if (!token) redirect("/login");

  const built = buildApiFormData(formData);
  if ("error" in built) return { error: built.error, values: built.values };

  const res = await updateDish(id, built.fd, token);
  if (!res.ok) return { error: res.message, values: built.values };

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function deleteDishAction(id: number) {
  const token = await getToken();
  if (!token) redirect("/login");

  const res = await deleteDish(id, token);
  if (!res.ok) return { error: res.message };

  revalidatePath(LIST_PATH);
}
