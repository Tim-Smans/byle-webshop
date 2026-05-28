import About from "@/components/home/about";
import Collections from "@/components/home/collections";
import FeaturedPieces from "@/components/home/featured";
import Hero from "@/components/home/hero";
import NewsLetter from "@/components/home/newsletter";
import Statement from "@/components/home/statement";

export default function Home() {
  return (
    <>
      <Hero/>
      <FeaturedPieces/>
      <Collections/>
      <About/>
      <Statement/>
      <NewsLetter/>
    </>
  );
}
