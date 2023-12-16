import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { scrypt, randomBytes } from "~/utils/registration.server";
import { db } from "~/drizzle/config.server";
import { user } from "~/drizzle/schema.server";
import { commitSession, getSession } from "~/session";

export async function action({ request }: ActionFunctionArgs) {
  let formData = await request.formData();
  let { email, password, code } = Object.fromEntries(formData);

  let requirementError;
  if (!email || !password || !code) {
    requirementError = "All fields are required.";
    return json({ error: requirementError }, 401);
  }

  const registrationSchema = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(12, { message: "Must be 12 characters or more" })
      .max(35, { message: "Can not be more than 35 characters" }),
    code: z.string(),
  });

  if (code !== "super-secret-code") {
    return json({ error: "Invalid invite code" });
  }

  const parsedSchema = registrationSchema.safeParse({ email, password, code });

  if (!parsedSchema.success) {
    return json({ zodError: parsedSchema.error }, 401);
  } else {
    // TODO: do something when email exists

    const salt = randomBytes(128).toString("base64");
    scrypt(password, salt, 64, async (err, derivedKey) => {
      if (err) {
        return json({ error: err }, 500);
      } else {
        console.log("inserting");
        await db.insert(user).values({
          email,
          password: derivedKey.toString(),
          salt,
        });
      }
    });
    let session = await getSession();
    session.set("isLoggedIn", true);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
    // if redirect, move there
    // else go to top
  }
}

// TODO:
export async function loader() {
  return null;
}

export default function RegisterPage() {
  // let actionData = useActionData<typeof action>();
  let actionData = useActionData<typeof action>();

  const zodError = (
    actionData as {
      zodError?: z.ZodError<{ email: string; password: string; code: string }>;
    }
  )?.zodError;
  console.log("zodE", zodError);
  const error = (actionData as { error?: string })?.error;
  return (
    <div>
      <h2>Register</h2>
      <Form method="post">
        <input type="email" name="email" required placeholder="Email" />
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
        />
        <input type="text" name="code" required placeholder="Invite Code" />
        <button type="submit">Submit</button>

        {error && <p className="mt-4 font-medium text-red-500">{error}</p>}
        {zodError &&
          zodError.issues.map((e) => (
            <p className="mt-4 font-medium text-red-500">{e.message}</p>
          ))}
      </Form>
    </div>
  );
}
