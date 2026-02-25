"use server";

import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!name) throw new Error("Name is required");

  await db.update(users)
    .set({ name, phone, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  revalidatePath("/dashboard/settings");
  return { success: true };
}
