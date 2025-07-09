import React from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import GrabTON from "@/components/GrabTON";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <FAQ />
      <div className="hidden desktop:block">
        <GrabTON />
      </div>
      <Footer />
    </main>
  );
}
