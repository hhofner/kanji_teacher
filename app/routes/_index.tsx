import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export default function Index() {
  return (
    <div className="flex flex-col h-full gap-8">
      <div className="md:space-y-4 space-y-8">
        <h1 className="md:text-6xl text-4xl font-bold">
          Improve your Kanji ability by staying motivated to write.
        </h1>
        <div className="flex flex-col justify-center items-center gap-8">
          <img
            src="/icons/ios-1024.png"
            className="w-32 h-32 rounded-2xl shadow-lg"
            alt="Oh My Kanji icon of a kanji character brush"
          />
          <p>
            Oh My Kanji is a companion PWA app for your Kanji study routine,
            available for any platform that has a browser. Select the Kanjis to
            study for the week, and then get to writing. Oh My Kanji provides to
            you a canvas to write as much as possible so that you can learn
            Kanji characters more effectively.
          </p>
        </div>
      </div>
      <div className="w-full flex justify-center">
        <Link to="/app">
          <Button className="font-bold flex gap-4 group shadow-md">
            <span>Try It Out</span>
            <svg
              className="-translate-x-2 group-hover:translate-x-0 transition-all"
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </Button>
        </Link>
      </div>
      <footer className="flex justify-center grow">
        <div className="h-full flex flex-col justify-end">
          <small>
            Made by 0x888fff, find me on{" "}
            <a
              href="https://mozilla.social/@hans"
              className=" mr-1 cursor-pointer font-bold"
            >
              Mastodon
            </a>
            or
            <a
              href="https://twitter.com/hofner_pls"
              className="ml-1 cursor-pointer font-bold"
            >
              Twitter
            </a>
          </small>
        </div>
      </footer>
    </div>
  );
}
