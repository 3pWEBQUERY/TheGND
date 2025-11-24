import { EscortCard } from "./EscortCard";
import { MobileFilterDrawer } from "./MobileFilterDrawer";

const MOCK_ESCORTS = [
    {
        id: 1,
        name: "Isabella",
        age: 23,
        location: "Berlin, Mitte",
        price: 250,
        image: "/images/model1.png",
        rating: 4.9,
        isNew: true,
    },
    {
        id: 2,
        name: "Sophia",
        age: 25,
        location: "München, Schwabing",
        price: 300,
        image: "/images/model2.png",
        rating: 5.0,
        isNew: false,
    },
    {
        id: 3,
        name: "Elena",
        age: 21,
        location: "Hamburg, HafenCity",
        price: 200,
        image: "/images/model3.png",
        rating: 4.7,
        isNew: true,
    },
    {
        id: 4,
        name: "Valentina",
        age: 26,
        location: "Köln, Innenstadt",
        price: 280,
        image: "/images/model4.png",
        rating: 4.8,
        isNew: false,
    },
];

export function EscortList() {
    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-white">Suchergebnisse <span className="text-gray-500 font-normal text-base ml-2">547</span></h2>
                <div className="flex items-center gap-4">
                    <MobileFilterDrawer />
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Sortieren nach:</span>
                        <select className="bg-transparent text-sm text-white focus:outline-none">
                            <option>Neueste</option>
                            <option>Preis aufsteigend</option>
                            <option>Preis absteigend</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {MOCK_ESCORTS.map((escort) => (
                    <EscortCard key={escort.id} {...escort} />
                ))}
                {MOCK_ESCORTS.map((escort) => (
                    <EscortCard key={`dup-${escort.id}`} {...escort} />
                ))}
            </div>
        </div>
    );
}
