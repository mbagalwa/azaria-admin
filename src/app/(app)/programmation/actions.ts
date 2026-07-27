"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getToken } from "@/lib/auth";
import {
  createProgram,
  deleteProgram,
  updateProgram,
  type ProgramPayload,
} from "@/lib/programs";

const LIST_PATH = "/programmation";

export type SaveProgramResult =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function createProgramAction(
  payload: ProgramPayload,
): Promise<SaveProgramResult> {
  const token = await getToken();
  if (!token) redirect("/login");

  const res = await createProgram(payload, token);
  if (!res.ok) return { ok: false, error: res.message };

  revalidatePath(LIST_PATH);
  return { ok: true, id: res.data.id };
}

export async function updateProgramAction(
  id: number,
  payload: ProgramPayload,
): Promise<SaveProgramResult> {
  const token = await getToken();
  if (!token) redirect("/login");

  const res = await updateProgram(id, payload, token);
  if (!res.ok) return { ok: false, error: res.message };

  revalidatePath(LIST_PATH);
  revalidatePath(`/programmation/${id}`);
  return { ok: true, id: res.data.id };
}

export async function deleteProgramAction(id: number) {
  const token = await getToken();
  if (!token) redirect("/login");

  const res = await deleteProgram(id, token);
  if (!res.ok) return { error: res.message };

  revalidatePath(LIST_PATH);
}
