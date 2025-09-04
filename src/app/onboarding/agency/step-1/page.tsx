"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function AgencyStep1Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === '1';
  const addEditParam = (href: string) => (isEditMode ? `${href}?edit=1` : href);
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill existing data on mount
  useEffect(() => {
    let ignore = false;
    const prefill = async () => {
      try {
        const res = await fetch('/api/onboarding/agency/step-1', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore) {
          setCompanyName(data?.companyName || "");
          setBusinessType(data?.businessType || "");
        }
      } catch {}
    };
    prefill();
    return () => { ignore = true };
  }, [isEditMode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (companyName.trim().length < 2 || businessType.trim().length < 2) {
      setError("Bitte Firmenname und Geschäftstyp ausfüllen (mind. 2 Zeichen).");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/onboarding/agency/step-1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: companyName.trim(), businessType: businessType.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Ein Fehler ist aufgetreten.");
        return;
      }
      router.push(addEditParam("/onboarding/agency/step-2"));
    } catch (err) {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="absolute top-0 w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <Link href={addEditParam('/onboarding')} className="text-sm font-light tracking-widest text-gray-600 hover:text-pink-500">Zur Übersicht</Link>
            <div className="text-sm font-light tracking-widest text-gray-600">AGENTUR • Schritt 1/7</div>
          </div>
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-thin tracking-wider text-gray-800 mb-2">
              <span className="sm:hidden">Unternehmens-</span>
              <span className="hidden sm:inline">Unternehmens</span>
              <span className="block sm:inline">informationen</span>
            </h1>
            <p className="text-sm font-light text-gray-500">Firmendaten und Geschäftstyp</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6 border p-6 bg-gray-50">
            {error && (
              <div className="p-3 text-sm font-light text-red-700 bg-red-50 border border-red-200">{error}</div>
            )}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-1">Firmenname</label>
              <input value={companyName} onChange={(e)=>setCompanyName(e.target.value)} className="w-full border px-3 py-2 text-sm" placeholder="z.B. Example Agency GmbH" />
            </div>
            <div>
              <label className="block text-sm font-light text-gray-700 mb-1">Geschäftstyp</label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Bitte auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agentur">Agentur</SelectItem>
                  <SelectItem value="Einzelunternehmen">Einzelunternehmen</SelectItem>
                  <SelectItem value="GmbH">GmbH</SelectItem>
                  <SelectItem value="UG (haftungsbeschränkt)">UG (haftungsbeschränkt)</SelectItem>
                  <SelectItem value="AG">AG</SelectItem>
                  <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between pt-4">
              <Link href={addEditParam('/onboarding')} className="text-sm font-light text-gray-600 hover:text-pink-500">Zur Übersicht</Link>
              <button type="submit" disabled={isLoading} className="bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-light tracking-widest px-8 py-2 text-sm uppercase">{isLoading ? "Speichern..." : "Weiter"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

