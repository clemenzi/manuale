import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware((context) => {
  const { pathname } = context.url;
  const section = pathname.split("/")[1]?.toLowerCase() ?? "";
  const route = context.locals.starlightRoute;

  route.siteTitle = "";

  const entry = route.sidebar.find((item) => item.label.toLowerCase() === section);

  if (!entry) {
    return;
  }

  route.sidebar = entry.type === "group" ? entry.entries : [entry];

  route.sidebar = route.sidebar.map((item) => {
    if (item.type !== "group" || !item.entries) return item;

    return {
      ...item,
      entries: item.entries.map((entry) => ({
        ...entry,
        label: entry.label.replace(/in .*/, ""),
      })),
    };
  });
});
