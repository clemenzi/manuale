import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

const sections = [
  { slug: "python", label: "Python", link: "/python/" },
  { slug: "cpp", label: "C++", link: "/cpp/" },
];

export const onRequest = defineRouteMiddleware((context) => {
  const { pathname } = context.url;
  const section = pathname.split("/")[1]?.toLowerCase() ?? "";
  const route = context.locals.starlightRoute;

  const matched = sections.find((s) => s.slug === section);
  if (matched) {
    route.siteTitle = `Manuale di ${matched.label}`;
  }

  const defaultSidebar = [
    {
      type: "link" as const,
      label: "Introduzione",
      href: "/",
      isCurrent: pathname === "/",
      badge: undefined,
      attrs: {},
    },
    ...sections.map((s) => ({
      type: "link" as const,
      label: s.label,
      href: s.link,
      isCurrent: pathname.startsWith(s.link),
      badge: undefined,
      attrs: {},
    })),
  ];

  if (!section) {
    route.sidebar = defaultSidebar;
    return;
  }

  const entry = route.sidebar.find((item) => item.label.toLowerCase() === section);
  if (!entry) {
    route.sidebar = defaultSidebar;
    return;
  }

  route.sidebar = entry.type === "group" ? entry.entries : [entry];
});
