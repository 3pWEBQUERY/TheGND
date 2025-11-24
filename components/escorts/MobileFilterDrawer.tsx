"use client";

import { useState } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function MobileFilterDrawer() {
    const [priceRange, setPriceRange] = useState([100, 1000]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="lg:hidden flex items-center gap-2 rounded-lg bg-[#282828] px-4 py-2 text-white hover:bg-[#383838]">
                    <SlidersHorizontal className="h-5 w-5" />
                    <span>Filter</span>
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto bg-[#121212] text-white border-white/10">
                <SheetHeader>
                    <SheetTitle className="text-white">Filters</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-8">
                    {/* Category */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-gray-400">Kategorie</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {["Escort", "Massage", "Domina", "Trans"].map((cat) => (
                                <button
                                    key={cat}
                                    className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-[#181818] p-3 transition hover:bg-[#282828] focus:border-[#E91E63] focus:bg-[#282828]"
                                >
                                    <span className="text-sm font-medium">{cat}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-gray-400">Verfügbarkeit</h3>
                        <div className="space-y-2">
                            {["Alle", "Jetzt verfügbar", "Heute verfügbar"].map((opt) => (
                                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="flex h-5 w-5 items-center justify-center rounded border border-gray-600 transition group-hover:border-white">
                                        {opt === "Alle" && <Check className="h-3 w-3 text-[#E91E63]" />}
                                    </div>
                                    <span className="text-sm text-gray-300 group-hover:text-white">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-gray-400">Stundensatz (€)</h3>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                value={priceRange[0]}
                                className="w-20 rounded bg-[#181818] p-2 text-center text-sm border border-white/10"
                                readOnly
                            />
                            <div className="h-[1px] flex-1 bg-gray-600"></div>
                            <input
                                type="number"
                                value={priceRange[1]}
                                className="w-20 rounded bg-[#181818] p-2 text-center text-sm border border-white/10"
                                readOnly
                            />
                        </div>
                        <div className="mt-4">
                            <div className="h-1 w-full rounded-full bg-gray-700 relative">
                                <div className="absolute left-0 top-0 h-full w-full rounded-full bg-[#E91E63]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-gray-400">Services</h3>
                        <div className="space-y-2">
                            {["Dinner Date", "Overnight", "Reisebegleitung", "Massage"].map((opt) => (
                                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="flex h-5 w-5 items-center justify-center rounded border border-gray-600 transition group-hover:border-white">
                                    </div>
                                    <span className="text-sm text-gray-300 group-hover:text-white">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button className="w-full rounded-lg bg-[#E91E63] py-3 font-bold text-white transition hover:bg-[#D81B60]">
                        Filter anwenden
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
