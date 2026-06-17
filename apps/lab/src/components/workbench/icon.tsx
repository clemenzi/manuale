import { getLanguageFromPath } from "#/lib/utils";
import { SiPhp } from "@icons-pack/react-simple-icons";

export default function FileIcon({ name }: { name: string }) {
  if (getLanguageFromPath(name) === "php") {
    return <SiPhp />;
  }

  return <></>;
}
