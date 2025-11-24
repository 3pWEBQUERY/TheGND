import Image from "next/image";
import { Play } from "lucide-react";

export function Hero() {
    return (
        <div className="relative h-[500px] w-full overflow-hidden rounded-3xl">
            <Image
                src="/images/hero.png"
                alt="Featured Model"
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent">
                <div className="flex h-full flex-col justify-center px-12">
                    <span className="mb-4 text-sm font-bold uppercase tracking-wider text-[#E91E63]">
                        Featured Selection
                    </span>
                    <h1 className="mb-6 max-w-xl text-5xl font-bold leading-tight text-white">
                        Experience the ultimate <br />
                        weekend companionship
                    </h1>
                    <p className="mb-8 max-w-lg text-lg text-gray-300">
                        Discover our exclusive selection of elite companions for your perfect evening.
                        Sophistication, elegance, and discretion guaranteed.
                    </p>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 rounded-md bg-[#E91E63] px-8 py-3 font-bold text-white transition hover:bg-[#D81B60]">
                            <Play className="h-5 w-5 fill-current" />
                            BOOK NOW
                        </button>
                        <button className="rounded-md border border-white/20 bg-white/10 px-8 py-3 font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                            VIEW PROFILE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
