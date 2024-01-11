import { Form, Link } from "@remix-run/react";

export default function Username({
	isLoggedIn,
	userName,
}: {
	isLoggedIn: boolean;
	userName?: string;
}) {
	return isLoggedIn ? (
		<Form action="/logout" method="post">
			<button type="submit">Log Out</button>
		</Form>
	) : (
		<Link to="/login">Log In</Link>
	);
}
