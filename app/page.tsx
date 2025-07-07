import React from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AirdropSection from "@/components/AirdropSection";
import HowItWorks from "@/components/HowItWorks";
import Stats from "@/components/Stats";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <Stats />
      <AirdropSection />
      <HowItWorks />
      <FAQ />
      <Footer />
    </main>
  );
}
