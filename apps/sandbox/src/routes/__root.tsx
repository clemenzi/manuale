import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import "../styles.css";
import Navbar from "#/components/navbar";
import { ThemeProvider } from "#/contexts/theme";
import Mobile from "#/components/mobile";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        title: "Manuale.dev Sandboxes",
      },
      {
        name: "description",
        content:
          "Sperimenta con varie linguaggi, database e librerie di programmazione direttamente dal tuo browser",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <ThemeProvider defaultTheme="system">
        <HeadContent />
        <div className="md:hidden">
          <Mobile />
        </div>
        <div className="hidden md:block">
          <Navbar />
          <Outlet />
        </div>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </ThemeProvider>
    </>
  );
}
