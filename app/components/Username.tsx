import { Link } from "@remix-run/react"

export default function Username({
	isLoggedIn,
	userName
}: { isLoggedIn: boolean, userName?: string }) {
	return (isLoggedIn ? <Link to="/logout">Log Out</Link> : <Link to="/login">Log In</Link>
)}