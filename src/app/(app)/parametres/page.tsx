import { redirect } from "next/navigation";

/** /parametres redirige vers la première sous-section. */
export default function ParametresIndexPage() {
  redirect("/parametres/plats");
}
