import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";
import Username from "./components/Username";
import { getSession } from "~/session";
import { useSWEffect } from '@remix-pwa/sw'
import { LiveReload } from '@remix-pwa/sw'

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request }: LoaderFunctionArgs) {
  let session = await getSession(request.headers.get("cookie"));

  return session.data;
}

const validRoutes = ["/about", "/search"];

export default function App() {
  let data = useLoaderData<typeof loader>();
  let location = useLocation();
  useSWEffect();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link href="icons/ios-1024.png" id="icons/ios-1024.png" rel="apple-touch-icon" sizes="1024x1024" type="image/png"/>
        <Meta />
        <Links />
      </head>
      <body
        className={`h-webkit antialiased ${
          validRoutes.includes(location.pathname) ? "" : "overflow-hidden"
        }`}
      >
        <div className="p-4 md:p-8 rounded-lg md:max-w-3xl mx-auto  h-full flex flex-col">
          <header className="flex justify-between mb-12">
            <Link to="/">
              <h1 className="text-2xl font-bold md:mb-8">
                Oh My <span className="text-gray-400 italic">Kanji</span>
              </h1>
            </Link>
            <div className="flex gap-4">
              <Link to="/about">About</Link>
              <Username isLoggedIn={data.isLoggedIn} />
            </div>
          </header>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
