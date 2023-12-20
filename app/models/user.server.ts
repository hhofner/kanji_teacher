// import type { Password, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { user } from "~/drizzle/schema.server";

type User = typeof user.$inferSelect

export async function getUserById(id: User["id"]) {
  const potentialUser = await db.select().from(user).where(eq(user.id, id))
  if (potentialUser[0]) {
    return potentialUser[0]
  }
  return undefined
}

export async function getUserByEmail(email: User["email"]) {
  if (!email) return undefined
  const potentialUser = await db.select().from(user).where(eq(user.email, email))
  if (potentialUser[0]) {
    return potentialUser[0]
  }
  return undefined
}

export async function createUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await db.insert(user).values({
    email,
    password: hashedPassword,
  }).returning()

  const { password: _password, ...userWithoutPassword } = newUser[0];

  return userWithoutPassword
}

// export async function deleteUserByEmail(email: User["email"]) {
//   return prisma.user.delete({ where: { email } });
// }

export async function verifyLogin(
  email: User["email"],
  password: User["password"],
) {
  if (!email || !password) return undefined
  const userWithPassword = await db.selectDistinct().from(user).where(eq(user.email, email))

  if (!userWithPassword[0] || !userWithPassword[0].password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword[0].password
  );

  if (!isValid) {
    return null;
  }
  const { password: _password, ...userWithoutPassword } = userWithPassword[0];

  return userWithoutPassword;
}
