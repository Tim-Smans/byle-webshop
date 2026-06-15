import { isAdmin } from "@/lib/auth/admin-auth";
import { redirect } from "next/navigation";
import MigrateImagesClient from "./migrate-images-client";

export default async function MigrateImagesPage() {
  const authorized = await isAdmin();
  if (!authorized) redirect("/");

  return <MigrateImagesClient />;
}
