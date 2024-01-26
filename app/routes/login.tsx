import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  redirect,
  json,
} from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/session";
import { verifyLogin } from "~/models/user.server";
import { Button } from "~/components/ui/button";

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

  const userWithoutPassword = await verifyLogin(email, password);

  if (!userWithoutPassword) {
    error = "Credentials are wrong";
    return json({ error }, 401);
  }

  let session = await getSession();
  session.set("isLoggedIn", true);
  session.set("userId", userWithoutPassword.id);

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
  console.log("data: ", data.userId);
  let actionData = useActionData<typeof action>();

  return (
    <div className="mx-auto mt-8 max-w-xs lg:max-w-sm">
      {data.isLoggedIn ? (
        <p>You're signed in!</p>
      ) : (
        <Form method="post">
          <h2 className="text-2xl mb-6 font-bold">Log In</h2>
          <div className="space-y-2">
            <input
              className="w-full p-4 rounded-md border-gray-100 border focus:border-sky-600 focus:ring-sky-600"
              type="email"
              name="email"
              required
              placeholder="Email"
            />
            <input
              className="w-full p-4 border rounded-md border-gray-100 focus:border-sky-600 focus:ring-sky-600"
              type="password"
              name="password"
              required
              placeholder="Password"
            />
          </div>

          <div className="mt-8">
            <Button className="w-full">
              Log in
            </Button>
          </div>

          <p className="mt-4 font-medium text-red-500">{actionData?.error}</p>
          <div className="w-full mt-8 text-center">
            or{" "}
            <Link to="/register" className="font-bold">
              register
            </Link>
          </div>
        </Form>
      )}
    </div>
  );
}
