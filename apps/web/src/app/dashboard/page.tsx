import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardScreen } from "@/screens/dashboard";
import { authClient } from "@/shared/api";

export default async function DashboardPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardScreen userName={session.user.name} />;
}
