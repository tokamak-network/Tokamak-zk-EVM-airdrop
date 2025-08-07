import React from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import GrabTON from "@/components/GrabTON";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 overflow-x-hidden">
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
