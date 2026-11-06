import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "X Marketing";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "X Marketing \u1019\u103e \u101c\u1030\u1000\u103c\u102e\u1038\u1019\u1004\u103a\u1038\u1010\u102d\u102f\u1037\u1021\u1010\u103d\u1000\u103a \u1000\u1031\u102c\u1004\u103a\u1038\u1019\u103c\u1010\u103a\u101e\u1031\u102c \u101c\u1000\u103a\u1006\u1031\u102c\u1004\u103a\u1019\u103b\u102c\u1038\u104a \u1021\u1031\u102c\u1004\u103a\u1019\u103c\u1004\u103a\u1019\u103e\u102f \u1015\u1014\u103a\u1038\u1005\u100a\u103a\u1038\u1014\u103e\u1004\u1037\u103a \u1021\u1014\u102c\u1002\u1010\u103a\u104f \u1010\u1031\u102c\u1000\u103a\u1015\u103c\u1001\u103a\u1038 \u1021\u101c\u1004\u103a\u1038\u1019\u103b\u102c\u1038\u1000\u102d\u102f \u1006\u1031\u102c\u1004\u103a\u101a\u1030\u1015\u1031\u1038\u1015\u102b\u101e\u100a\u103a\u104b",
      },
      { name: "theme-color", content: "#0a0a0a" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@400;700&family=Noto+Sans+Myanmar:wght@400;600;700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="my" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
