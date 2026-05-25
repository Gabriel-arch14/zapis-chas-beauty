import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-mauve">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Страницата не е намерена</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Страницата, която търсите, не съществува.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Към началото
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ruseva Nails Studio — Маникюр и педикюр в Габрово" },
      { name: "description", content: "Професионален маникюр и педикюр в сърцето на Габрово. Запишете час онлайн — бързо и лесно!" },
      { property: "og:title", content: "Ruseva Nails Studio — Маникюр и педикюр в Габрово" },
      { property: "og:description", content: "Професионален маникюр и педикюр в сърцето на Габрово. Запишете час онлайн — бързо и лесно!" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Ruseva Nails Studio — Маникюр и педикюр в Габрово" },
      { name: "twitter:description", content: "Професионален маникюр и педикюр в сърцето на Габрово. Запишете час онлайн — бързо и лесно!" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b6be73e6-5c91-4064-885a-542d3bae5db9/id-preview-95af8bee--021486cf-cf31-4956-9d7e-68dd73413c63.lovable.app-1779270752782.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b6be73e6-5c91-4064-885a-542d3bae5db9/id-preview-95af8bee--021486cf-cf31-4956-9d7e-68dd73413c63.lovable.app-1779270752782.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
