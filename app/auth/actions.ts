"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function mockLogin(castId: string) {
  cookies().set("nightos.mock-cast-id", castId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: "lax",
  });
  redirect("/");
}

export async function mockLogout() {
  cookies().delete("nightos.mock-cast-id");
  redirect("/auth/login");
}
