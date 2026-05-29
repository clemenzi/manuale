import logoDark from "#/assets/logo-dark.svg";
import logoLight from "#/assets/logo-light.svg";
import { Link } from "@tanstack/react-router";

export default function Navbar() {
  return (
    <nav className="p-4 flex items-center justify-between bg-secondary">
      <Link to="/">
        <img src={logoLight} alt="Logo" className="dark:hidden w-24" />
        <img src={logoDark} alt="Logo" className="hidden dark:block w-24" />
      </Link>
    </nav>
  );
}
