import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, SunIcon } from "@hugeicons/core-free-icons";
import { useTheme } from "#/contexts/theme";
import { Badge } from "./ui/badge";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="p-4 flex items-center justify-between bg-muted">
      <Link to="/">
        <span className="font-logo text-4xl flex items-center space-x-2">
          MAN<span className="text-primary">(SANDBOX)</span>
          <Badge variant={"outline"}>ALPHA</Badge>
        </span>
      </Link>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <HugeiconsIcon icon={theme === "dark" ? SunIcon : Moon02Icon} />
        </Button>
      </div>
    </nav>
  );
}
