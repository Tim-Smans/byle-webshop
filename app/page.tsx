import About from "@/components/home/about";
import FeaturedPieces from "@/components/home/featured";
import Hero from "@/components/home/hero";
import NewsLetter from "@/components/home/newsletter";

export default function Home() {
  return (
    <>
      <Hero/>
      <FeaturedPieces/>
      <About/>
      <NewsLetter/>
    </>
  );
}
