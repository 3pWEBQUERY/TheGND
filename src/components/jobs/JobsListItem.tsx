import Image from 'next/image'
import Link from 'next/link'

export type JobItem = {
  id: string
  title: string
  shortDesc: string
  description?: string
  category: 'ESCORT' | 'CLEANING' | 'SECURITY' | 'HOUSEKEEPING'
  city?: string | null
  country?: string | null
  media?: string[]
  createdAt?: string
  postedBy?: { id: string; userType: string; displayName: string | null; avatar: string | null; companyName: string | null }
}

export default function JobsListItem({ job }: { job: JobItem }) {
  const cover = (job.media && job.media[0]) || job.postedBy?.avatar || null
  const location = [job.city || '', job.country || ''].filter(Boolean).join(', ')
  const company = job.postedBy?.companyName || job.postedBy?.displayName || ''
  const catLabel = (
    job.category === 'ESCORT' ? 'Escort' :
    job.category === 'CLEANING' ? 'Reinigungskraft' :
    job.category === 'SECURITY' ? 'Security' : 'Hausdame'
  )

  return (
    <div className="w-full border border-gray-200 bg-white hover:shadow-sm transition-shadow">
      <div className="grid grid-cols-[120px_1fr_140px] md:grid-cols-[180px_1fr_160px]">
        {/* Left: Portrait image */}
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          {cover ? (
            <Image src={cover} alt={job.title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">KEIN BILD</div>
          )}
        </div>

        {/* Middle: details */}
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg md:text-xl font-thin tracking-wider text-gray-900">{job.title}</h3>
            {company && (
              <div className="hidden md:block text-xs text-gray-500 truncate max-w-[40%]">{company}</div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-700 line-clamp-2 md:line-clamp-3">{job.shortDesc}</div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-gray-600">
            <span className="px-2 py-1 border border-gray-300">{catLabel}</span>
            {location && <span className="px-2 py-1 border border-gray-300">{location}</span>}
            {company && <span className="px-2 py-1 border border-gray-300">{company}</span>}
          </div>
        </div>

        {/* Right: vertical buttons */}
        <div className="p-4 md:p-6 flex flex-col items-stretch justify-center gap-2 border-l border-gray-100">
          <Link href={`/jobs/${job.id}`} className="px-3 py-2 text-xs uppercase tracking-widest text-center bg-pink-500 hover:bg-pink-600 text-white">Details</Link>
          <button className="px-3 py-2 text-xs uppercase tracking-widest border border-gray-300 hover:border-pink-500 hover:text-pink-600">Kontakt</button>
          <button className="px-3 py-2 text-xs uppercase tracking-widest border border-gray-300 hover:border-pink-500 hover:text-pink-600">Teilen</button>
        </div>
      </div>
    </div>
  )
}
