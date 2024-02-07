import { json } from "@remix-run/node";

export const loader = async () => {
  return json(
    {
      short_name: "OMK",
      name: "Oh My Kanji",
      start_url: "/",
      display: "standalone",
      background_color: "#d3d7dd",
      theme_color: "#16A34A",
      shortcuts: [
        {
          name: "Homepage",
          url: "/",
          icons: [
            {
              src: "/icons/ios-1024.png",
              sizes: "1024x1024",
              type: "image/png",
              purpose: "any monochrome",
            },
          ],
        },
      ],
      icons: [
        {
          src: "/icons/ios-1024.png",
          sizes: "1024x1024",
          type: "image/png",
        },
        {
          src: "/icons/mac-1024.png",
          sizes: "1024x1024",
          type: "image/png",
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "application/manifest+json",
      },
    },
  );
};
