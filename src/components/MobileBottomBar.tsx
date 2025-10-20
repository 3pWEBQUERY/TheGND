"use client";
import Link from "next/link";
import { Star, Phone } from "lucide-react";

type Props = {
  name?: string | null;
  locationText?: string | null;
  ratingAvg?: number;
  ratingCount?: number;
  phone?: string | null;
  commentsAnchor?: string; // default: 'kommentare'
};

export default function MobileBottomBar({
  name,
  locationText,
  ratingAvg = 0,
  ratingCount = 0,
  phone,
  commentsAnchor = "kommentare",
}: Props) {
  const safeName = name || "ESCORT";
  const rating = Math.max(0, Math.min(5, Number.isFinite(ratingAvg) ? ratingAvg : 0));
  const stars = Math.round(rating);

  return (
    <>
      {/* Floating call button (only if phone exists) */}
      {phone ? (
        <a
          href={`tel:${phone}`}
          className="fixed right-4 bottom-[88px] sm:hidden z-50 h-12 w-12 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg border border-pink-200"
          aria-label="Anrufen"
        >
          <Phone className="h-6 w-6" />
        </a>
      ) : null}

      {/* Bottom bar */}
      <div className="fixed inset-x-0 bottom-0 sm:hidden z-50">
        <div className="mx-3 mb-3 rounded-t-md bg-gray-800/95 text-white shadow-lg border border-gray-700">
          <div className="px-4 py-3">
            <div className="text-lg font-light tracking-widest truncate">{safeName}</div>
            {rating > 0 && (
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < stars ? "text-amber-400" : "text-gray-500"}`}
                      fill="currentColor"
                    />
                  ))}
                </span>
                <span className="text-white/90">{`${rating.toFixed(1)}`}</span>
                {ratingCount > 0 && (
                  <>
                    <span className="text-white/60">|</span>
                    <Link
                      href={`#${commentsAnchor}`}
                      className="underline text-pink-300 hover:text-pink-200"
                    >
                      Berichte
                    </Link>
                  </>
                )}
              </div>
            )}
            {locationText && (
              <div className="text-xs text-gray-300 mt-1 truncate">{locationText}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
