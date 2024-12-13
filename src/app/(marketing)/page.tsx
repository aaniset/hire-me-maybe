import Features from "@/components/features";
import Hero from "@/components/hero";
import OpenSource from "@/components/open-source";

export default async function Home() {
  return (
    <>
      <Hero />
      <Features />
      <OpenSource />
    </>
  );
}
