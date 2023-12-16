import type { LinksFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";
import Username from "./components/Username";
import { getSession } from "~/session";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request }: LoaderFunctionArgs) {
  let session = await getSession(request.headers.get("cookie"));

  return session.data;
}

export default function App() {
  let data = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-webkit antialiased overflow-hidden">
        <div className="bg-white p-8 rounded-lg md:max-w-3xl mx-auto w-full">
          <div className="flex justify-between">
            <Link to="/">
              <h1 className="text-2xl font-bold mb-8">
                Oh My <span className="text-gray-400 italic">Kanji</span>
              </h1>
            </Link>
            <Username isLoggedIn={data.isLoggedIn} />
          </div>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
