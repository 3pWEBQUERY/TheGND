import { Sidebar } from "@/components/Sidebar";
import { FilterSidebar } from "@/components/escorts/FilterSidebar";
import { EscortList } from "@/components/escorts/EscortList";
import { MapView } from "@/components/escorts/MapView";

export default function EscortPage() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#121212] text-white">
            <Sidebar />
            <main className="flex flex-1 flex-col lg:flex-row transition-all duration-300 sm:ml-[var(--sidebar-width)]">
                <FilterSidebar />
                <EscortList />
                <MapView />
            </main>
        </div>
    );
}
