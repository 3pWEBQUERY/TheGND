import Image from "next/image";
import { MapPin, Star, Heart } from "lucide-react";

interface EscortCardProps {
    name: string;
    age: number;
    location: string;
    price: number;
    image: string;
    rating: number;
    isNew?: boolean;
}

export function EscortCard({ name, age, location, price, image, rating, isNew }: EscortCardProps) {
    return (
        <div className="group relative flex flex-col sm:flex-row gap-3 sm:gap-4 rounded-xl bg-[#181818] p-3 transition hover:bg-[#202020]">
            {/* Image */}
            <div className="relative h-48 sm:h-32 w-full sm:w-32 flex-shrink-0 overflow-hidden rounded-lg">
                <Image src={image} alt={name} fill className="object-cover transition duration-300 group-hover:scale-105" />
                {isNew && (
                    <span className="absolute left-2 top-2 rounded bg-[#E91E63] px-2 py-0.5 text-[10px] font-bold text-white">
                        NEU
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white">{name}, {age}</h3>
                            <div className="flex items-center text-xs text-gray-400">
                                <MapPin className="mr-1 h-3 w-3" />
                                {location}
                            </div>
                        </div>
                        <button className="rounded-full bg-white/5 p-1.5 text-gray-400 hover:bg-white/10 hover:text-[#E91E63]">
                            <Heart className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-white">{rating}</span>
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        </div>
                        <div className="h-1 w-1 rounded-full bg-gray-600"></div>
                        <div className="text-gray-400">3 Bewertungen</div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                        <span className="text-lg font-bold text-[#E91E63]">{price}€</span>
                        <span className="text-xs text-gray-400"> / Stunde</span>
                    </div>
                    <button className="w-full sm:w-auto rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10">
                        Profil ansehen
                    </button>
                </div>
            </div>
        </div>
    );
}
