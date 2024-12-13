import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AnimatedGradientText from "@/components/magicui/animated-gradient-text";
import Image from "next/image";
import { BorderBeam } from "@/components/magicui/border-beam";
import { siteConfig } from "@/config/site";

function HeroPill({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href}>
      <AnimatedGradientText>
        <div
          className={cn(
            `absolute inset-0 block size-full animate-gradient bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:var(--bg-size)_100%] [border-radius:inherit] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]`,
            `p-px ![mask-composite:subtract]`
          )}
        />
        🎉 <Separator className="mx-2 h-4" orientation="vertical" />
        <span
          className={cn(
            `animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
            `inline`
          )}
        >
          {title}
        </span>
        <ChevronRight className="ml-1 size-4 text-gray-500" />
      </AnimatedGradientText>
    </Link>
  );
}

export default async function Hero() {
  return (
    <section id="hero">
      <div className="relative h-full overflow-hidden py-5 md:py-14">
        <div className="z-10 flex flex-col">
          <div className="mt-10 grid grid-cols-1 md:mt-20">
            <div className="flex flex-col items-start gap-6 px-7 pb-8 text-center md:items-center md:px-10">
              <HeroPill
                href={siteConfig.links.twitter}
                title={`Follow along on twitter`}
              />
              <div className="relative flex flex-col gap-4 md:items-center lg:flex-row">
                <h1
                  className={cn(
                    "text-black dark:text-white",
                    "relative mx-0 max-w-[43.5rem]  pt-5  md:mx-auto md:px-4 md:py-2",
                    "text-left tracking-tighter text-balance md:text-center font-semibold",
                    "md:text-7xl lg:text-7xl sm:text-7xl text-5xl"
                  )}
                >
                  Automate job application tracking with Gmail and AI
                </h1>
              </div>

              <p className="max-w-xl text-balance text-left text-base tracking-tight text-black dark:font-medium dark:text-white md:text-center md:text-lg ">
                AI-powered job tracking without the hassle of plugins{" "}
              </p>

              <div className="mx-0 flex w-full max-w-full flex-col gap-4 py-1 sm:max-w-lg sm:flex-row md:mx-auto">
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-4">
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({
                        variant: "default",
                        size: "lg",
                      }),
                      "gap-2 whitespace-pre md:flex",
                      "group relative w-full gap-1 rounded-xl text-sm font-semibold tracking-tighter ring-offset-inherit transition-all duration-150 ease-in-out hover:ring-2 hover:ring-black hover:ring-offset-2 hover:ring-offset-current dark:hover:ring-neutral-50"
                    )}
                  >
                    Sign Up
                    <ChevronRight className="ml-1  size-4 shrink-0 transition-all duration-300 ease-out group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/#features"
                    className={cn(
                      buttonVariants({
                        size: "lg",
                        variant: "outline",
                      }),
                      "gap-2 whitespace-pre md:flex",
                      "group relative w-full gap-1 overflow-hidden rounded-xl text-sm font-semibold tracking-tighter transition-all duration-150 ease-in-out hover:ring-2 hover:ring-neutral-300 hover:ring-offset-2 hover:ring-offset-inherit dark:hover:ring-black dark:hover:ring-offset-black "
                    )}
                  >
                    Learn More
                    <ChevronRight className="ml-1 size-4 shrink-0 transition-all duration-300 ease-out group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center  md:min-h-screen">
            <div className="relative max-w-6xl w-full mt-7 px-6">
              <div className="relative rounded-xl flex justify-center items-center">
                <Image
                  src="/hero.png"
                  width={1200}
                  height={550}
                  alt="Hero Image"
                  priority={true}
                  className="dark:block rounded-[inherit] border object-contain shadow-lg hidden"
                />
                <BorderBeam size={250} duration={12} delay={9} />
              </div>
            </div>
          </div>
          <div className="relative mx-auto flex w-full max-w-56 items-center justify-center"></div>
        </div>
      </div>
    </section>
  );
}
