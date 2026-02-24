import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default async function Home() {
  // Traemos también 'cover_path' para mostrar la portada en el inicio
  const { data, error } = await supabase
    .from('songs')
    .select('album, album_slug, album_year, cover_path')
    .order('album_year', { ascending: true }) // Los más nuevos primero suelen verse mejor

  if (error) return <div className="p-10 text-red-500">Error: {error.message}</div>

  // Quitar duplicados basándonos en el slug
  const albums = Array.from(
    new Map(data?.map(a => [a.album_slug, a])).values()
  )

  return (
  <main className="min-h-screen bg-[#050505] text-white selection:bg-yellow-400 selection:text-black">
    <div className="max-w-7xl mx-auto p-8 md:p-16">
      <header className="mb-16 space-y-2">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
          Clique Vault
        </h1>
        <p className="text-zinc-500 text-lg md:text-xl font-medium tracking-tight">
          A Twenty One Pilots digital discography archive.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">
        {albums.map((album) => {
          const { data: cover } = supabase.storage.from('songs').getPublicUrl(album.cover_path)

          return (
            <Link key={album.album_slug} href={`/album/${album.album_slug}`} className="group relative">
              <div className="relative aspect-square overflow-hidden rounded-none shadow-2xl ring-1 ring-white/10 transition-all duration-500 group-hover:ring-white/30 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <Image
                  src={cover.publicUrl}
                  alt={album.album}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay sutil al hacer hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="mt-4 space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wider truncate group-hover:text-yellow-400 transition-colors">
                  {album.album}
                </h2>
                <p className="text-xs font-mono text-zinc-500 italic">
                  [{album.album_year}]
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  </main>
)
}