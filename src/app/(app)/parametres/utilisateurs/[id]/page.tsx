import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserForm } from "@/components/admin/user-form";
import { getCurrentUser, getToken } from "@/lib/auth";
import { getUser } from "@/lib/users";
import { updateUserAction } from "../actions";

export const metadata = { title: "Modifier un utilisateur" };

export default async function EditUtilisateurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [token, me] = await Promise.all([getToken(), getCurrentUser()]);
  const res = token ? await getUser(id, token) : null;

  if (!res || !res.ok) {
    notFound();
  }

  const user = res.data;
  const isSelf = me?.id === user.id;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/parametres/utilisateurs"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Retour aux utilisateurs
        </Link>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">
          Modifier {user.fullName ?? user.email}
        </h2>
      </div>

      <UserForm
        action={updateUserAction.bind(null, user.id)}
        user={user}
        submitLabel="Enregistrer"
        isSelf={isSelf}
      />
    </div>
  );
}
