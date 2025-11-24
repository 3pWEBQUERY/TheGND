import Image from "next/image";
import { Sidebar } from "@/components/Sidebar";
import { Hero } from "@/components/Hero";
import { ModelCard } from "@/components/ModelCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const newReleases = [
    { name: "Lemonade", tag: "Blonde, 24", image: "/images/model1.png" },
    { name: "Scarlett", tag: "Redhead, 22", image: "/images/model3.png" },
    { name: "Raven", tag: "Brunette, 26", image: "/images/model2.png" },
    { name: "Jasmine", tag: "Exotic, 23", image: "/images/model4.png" },
    { name: "Crystal", tag: "Platinum, 21", image: "/images/model1.png" },
    { name: "Amber", tag: "Honey, 25", image: "/images/model2.png" },
  ];

  const popularArtists = [
    { name: "Astrid S", tag: "Elite Companion", image: "/images/model1.png" },
    { name: "Adele", tag: "VIP Escort", image: "/images/model2.png" },
    { name: "Arabian Horses", tag: "Duo Experience", image: "/images/model3.png" },
    { name: "KISS", tag: "Party Girls", image: "/images/model4.png" },
    { name: "Maloma", tag: "Boyfriend Experience", image: "/images/model1.png" },
  ];

  return (
    <div className="flex min-h-screen bg-[#121212] text-white">
      <Sidebar />

      <main className="ml-0 flex-1 pb-24 sm:ml-64">
        <div className="p-8">
          {/* Header Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-4">
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 hover:bg-black/60">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 hover:bg-black/60">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-8 text-sm font-bold tracking-widest text-gray-400">
              <span className="cursor-pointer text-white border-b-2 border-[#E91E63] pb-1">RECOMMENDED</span>
              <span className="cursor-pointer hover:text-white transition">NEW ARRIVALS</span>
              <span className="cursor-pointer hover:text-white transition">TOP RATED</span>
              <span className="cursor-pointer hover:text-white transition">MOODS</span>
              <span className="cursor-pointer hover:text-white transition">NEAR YOU</span>
            </div>
            <div className="w-8"></div> {/* Spacer for balance */}
          </div>

          <Hero />

          {/* New Releases Section */}
          <div className="mt-12">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-2xl font-bold">New Arrivals for you</h2>
              <div className="flex gap-2">
                <ChevronLeft className="h-5 w-5 cursor-pointer text-gray-400 hover:text-white" />
                <ChevronRight className="h-5 w-5 cursor-pointer text-gray-400 hover:text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {newReleases.map((model, i) => (
                <ModelCard key={i} {...model} isNew={i === 2} />
              ))}
            </div>
          </div>

          {/* Popular Artists Section */}
          <div className="mt-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold">Popular Models You May Like</h2>
                <p className="text-sm text-gray-400">Based on your recent views</p>
              </div>
              <span className="cursor-pointer text-xs font-bold tracking-widest text-gray-400 hover:text-white">SHOW ALL</span>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
              {popularArtists.map((model, i) => (
                <div key={i} className="group relative cursor-pointer">
                  <div className="relative aspect-square overflow-hidden rounded-full">
                    <Image src={model.image} alt={model.name} fill className="object-cover transition duration-300 group-hover:scale-105" />
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="font-bold">{model.name}</h3>
                    <p className="text-sm text-gray-400">{model.tag}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* List Section */}
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-xl font-bold">Most Popular This Week</h2>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="flex items-center gap-4 rounded-md p-2 hover:bg-white/5 group">
                    <span className="w-4 text-center text-gray-400">{num}</span>
                    <div className="relative h-10 w-10 overflow-hidden rounded">
                      <Image src={`/images/model${(num % 4) + 1}.png`} alt="Model" fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">Midnight Special</h4>
                      <p className="text-xs text-gray-400">Lady Frank</p>
                    </div>
                    <span className="text-xs text-gray-400">Available</span>
                    <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-6 text-xl font-bold">Most Recommended</h2>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="flex items-center gap-4 rounded-md p-2 hover:bg-white/5 group">
                    <span className="w-4 text-center text-gray-400">{num}</span>
                    <div className="relative h-10 w-10 overflow-hidden rounded">
                      <Image src={`/images/model${(num % 4) + 1}.png`} alt="Model" fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">Dinner Date</h4>
                      <p className="text-xs text-gray-400">Lady Frank</p>
                    </div>
                    <span className="text-xs text-gray-400">Available</span>
                    <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
