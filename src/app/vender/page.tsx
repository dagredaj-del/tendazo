import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function VenderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si ya tiene sesión, va directo a su panel.
  if (user) redirect("/panel");
  // Si no, al login.
  redirect("/login");
}
