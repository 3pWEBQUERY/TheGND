import Image from "next/image";
import { Play, Heart, MoreHorizontal } from "lucide-react";

interface ModelCardProps {
    name: string;
    tag: string;
    image: string;
    isNew?: boolean;
}

export function ModelCard({ name, tag, image, isNew }: ModelCardProps) {
    return (
        <div className="group relative w-full cursor-pointer rounded-md bg-[#181818] p-4 transition hover:bg-[#282828]">
            <div className="relative aspect-square w-full overflow-hidden rounded-md shadow-lg">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                />
                {isNew && (
                    <span className="absolute left-2 top-2 rounded bg-[#E91E63] px-2 py-0.5 text-xs font-bold text-white">
                        NEW
                    </span>
                )}
                <div className="absolute bottom-2 right-2 translate-y-full opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E91E63] text-white hover:scale-105 hover:bg-[#D81B60]">
                        <Play className="h-5 w-5 fill-current pl-0.5" />
                    </button>
                </div>
            </div>
            <div className="mt-4">
                <h3 className="truncate font-bold text-white">{name}</h3>
                <p className="line-clamp-2 text-sm text-gray-400">{tag}</p>
            </div>
        </div>
    );
}
