import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { db } from "./drizzle/config.server";
import { user } from "./drizzle/schema.server";
import { eq } from "drizzle-orm";

let SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("ENV variable SESSION_SECRET must be defined.");
}

interface User {
  id: string;
}

const USER_SESSION_KEY = "userId";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "oh-my-kanji-session",
      secrets: [SESSION_SECRET],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export async function getUserId(
  request: Request,
): Promise<User["id"] | undefined> {
  const session = await getSession(request.headers.get("cookie"));
  const userId = session.get(USER_SESSION_KEY);
  return userId as User["id"] | undefined;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  // TODO: Move this into some function
  // const user = await getUserById(userId);
  // if (user) return user;

  const possibleUser = await db
    .select()
    .from(user)
    .where(eq(user.id, parseInt(userId)));

  if (possibleUser[0]) return possibleUser[0];

  throw await logout(request);
}
