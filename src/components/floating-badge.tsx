import Link from "next/link";
import { BorderBeam } from "@/components/magicui/border-beam";
import { siteConfig } from "@/config/site";
import { Icons } from "./icons";

const FloatingBadge = () => {
  return (
    <Link
      href={siteConfig.links.twitter}
      target="_blank"
      className="fixed bottom-4 right-4 bg-black border text-white px-3 py-2 rounded-full shadow-lg text-xs font-semibold z-50 hover:bg-zinc-800 transition-colors duration-300"
    >
      <div className="flex items-center gap-1">
        <span>Follow on</span>
        <Icons.twitter className="h-3 w-3 fill-current" />
        <span className="sr-only">Twitter</span>
      </div>
      <BorderBeam size={60} duration={4} delay={4} />
    </Link>
  );
};

export default FloatingBadge;
