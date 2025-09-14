import React from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import GrabTON from "@/components/GrabTON";

//test commit2
export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#0a1930] to-[#1a2347] overflow-x-hidden relative">
        <Hero />
        <FAQ />
        <div className="hidden desktop:block">
          <GrabTON />
        </div>
        <Footer />
      </main>
    </>
  );
}
