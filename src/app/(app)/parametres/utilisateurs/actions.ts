"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getToken } from "@/lib/auth";
import { createUser, deleteUser, updateUser } from "@/lib/users";

const LIST_PATH = "/parametres/utilisateurs";

export type UserFormValues = {
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
};

export type UserFormState = {
  ok?: boolean;
  error?: string;
  values?: UserFormValues;
};

function readValues(formData: FormData): UserFormValues {
  return {
    fullName: String(formData.get("fullName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    isActive: formData.get("isActive") != null,
  };
}

export async function createUserAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const token = await getToken();
  if (!token) redirect("/login");

  const values = readValues(formData);
  const password = String(formData.get("password") ?? "");

  if (values.fullName && values.fullName.length < 2) {
    return { error: "Le nom doit faire au moins 2 caractères.", values };
  }
  if (!values.email) return { error: "L'email est requis.", values };
  if (password.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères.", values };
  }
  if (!values.role) return { error: "Choisissez un rôle.", values };

  const res = await createUser(
    {
      fullName: values.fullName || null,
      email: values.email,
      password,
      role: values.role,
    },
    token,
  );
  if (!res.ok) return { error: res.message, values };

  // Pas de redirect : le formulaire vit dans un modal, on renvoie le succès
  // pour que l'appelant ferme le modal et rafraîchisse la liste.
  revalidatePath(LIST_PATH);
  return { ok: true };
}

export async function updateUserAction(
  id: number,
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const token = await getToken();
  if (!token) redirect("/login");

  const values = readValues(formData);
  if (!values.email) return { error: "L'email est requis.", values };
  if (!values.role) return { error: "Choisissez un rôle.", values };

  const res = await updateUser(
    id,
    {
      fullName: values.fullName || null,
      email: values.email,
      role: values.role,
      isActive: values.isActive,
    },
    token,
  );
  if (!res.ok) return { error: res.message, values };

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function deleteUserAction(id: number) {
  const token = await getToken();
  if (!token) redirect("/login");

  const res = await deleteUser(id, token);
  if (!res.ok) return { error: res.message };

  revalidatePath(LIST_PATH);
}

export async function toggleUserActiveAction(id: number, isActive: boolean) {
  const token = await getToken();
  if (!token) redirect("/login");

  await updateUser(id, { isActive }, token);

  revalidatePath(LIST_PATH);
}
