import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  redirect,
  json,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { db } from "~/drizzle/config.server";
import { user } from "~/drizzle/schema.server";
import { eq } from "drizzle-orm";
import { commitSession, getSession } from "~/session";
import { scrypt } from "~/utils/registration.server";

export async function action({ request }: ActionFunctionArgs) {
  let formData = await request.formData();
  let { email, password } = Object.fromEntries(formData) as {
    email?: string;
    password?: string;
  };

  let error;
  if (!email) {
    error = "Email is required";
    return json({ error }, 401);
  }
  if (!password) {
    error = "Password is required";
    return json({ error }, 401);
  }

  const possibleUser = await db
    .select()
    .from(user)
    .where(eq(user.email, email));
  if (!possibleUser[0]) {
    error = "Some credentials are wrong";
    return json({ error }, 401);
  }

  const loggingInUser = possibleUser[0];

  scrypt(loggingInUser.password, loggingInUser.salt, 64, (err, derivedKey) => {
    if (err) {
      return json({ error: "Something went wrong" }, 500);
    } else {
      if (derivedKey.toString() !== password) {
        error = "Some credentials are wrong";
        return json({ error }, 401);
      }
    }
  });

  let session = await getSession();
  session.set("isLoggedIn", true);
  session.set("userId", loggingInUser.id);

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  let session = await getSession(request.headers.get("cookie"));

  return session.data;
}

export default function LoginPage() {
  let data = useLoaderData<typeof loader>();
  console.log("data: ", data.userId)
  let actionData = useActionData<typeof action>();

  return (
    <div className="mx-auto mt-8 max-w-xs lg:max-w-sm">
      {data.isLoggedIn ? (
        <p>You're signed in!</p>
      ) : (
        <Form method="post">
          <div className="space-y-2">
            <input
              className="w-full rounded-md border-black focus:border-sky-600 focus:ring-sky-600"
              type="email"
              name="email"
              required
              placeholder="Email"
            />
            <input
              className="w-full rounded-md border-gray-100 focus:border-sky-600 focus:ring-sky-600"
              type="password"
              name="password"
              required
              placeholder="Password"
            />
          </div>

          <div className="mt-8">
            <button className="w-full rounded-md bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:ring-offset-gray-900">
              Log in
            </button>
          </div>

          {actionData?.error && (
            <p className="mt-4 font-medium text-red-500">{actionData.error}</p>
          )}
        </Form>
      )}
    </div>
  );
}
