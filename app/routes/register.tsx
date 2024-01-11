import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { commitSession, getSession } from "~/session";
import { createUser } from "~/models/user.server";

export async function action({ request }: ActionFunctionArgs) {
	let formData = await request.formData();
	let { email, password, code } = Object.fromEntries(formData) as {
		email?: string;
		password?: string;
		code?: string;
	};

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

	const parsedSchema = registrationSchema.safeParse({
		email,
		password,
		code,
	});

	if (!parsedSchema.success) {
		return json({ zodError: parsedSchema.error }, 401);
	} else {
		// TODO: do something when email exists

		const userWithoutPassword = await createUser(email, password);
		let session = await getSession();
		session.set("isLoggedIn", true);
		session.set("userId", userWithoutPassword.id);

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
			zodError?: z.ZodError<{
				email: string;
				password: string;
				code: string;
			}>;
		}
	)?.zodError;
	console.log("zodE", zodError);
	const error = (actionData as { error?: string })?.error;
	return (
		<div className="mx-auto mt-8 max-w-xs lg:max-w-sm">
			<h2 className="text-2xl mb-6 font-bold">Register</h2>
			<Form method="post" className="space-y-2">
				<input
					type="email"
					name="email"
					required
					placeholder="Email"
					className="w-full p-4 rounded-md border-gray-100 border focus:border-sky-600 focus:ring-sky-600"
				/>
				<input
					type="password"
					name="password"
					className="w-full p-4 rounded-md border-gray-100 border focus:border-sky-600 focus:ring-sky-600"
					required
					placeholder="Password"
				/>
				<input
					type="text"
					name="code"
					required
					placeholder="Invite Code"
					className="w-full p-4 rounded-md border-gray-100 border focus:border-sky-600 focus:ring-sky-600"
				/>
				<button
					type="submit"
					className="w-full rounded-md bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:ring-offset-gray-900"
				>
					Submit
				</button>

				{error && (
					<p className="mt-4 font-medium text-red-500">{error}</p>
				)}
				{zodError &&
					zodError.issues.map((e) => (
						<p className="mt-4 font-medium text-red-500">
							{e.message}
						</p>
					))}
			</Form>
		</div>
	);
}
