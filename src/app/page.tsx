import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Metadata } from 'next'

// 1. Configuración de Metadata para SEO y Pestaña del Navegador
export const metadata: Metadata = {
  title: 'Clique Vault | TØP Archive',
  description: 'Explora la discografía completa de Twenty One Pilots. Un archivo digital para la Skeleton Clique.',
}

export default async function Home() {
  // 2. Fetching de datos: traemos la info necesaria de la tabla 'songs'
  const { data, error } = await supabase
    .from('songs')
    .select('album, album_slug, album_year, cover_path')
    .order('album_year', { ascending: true }) // Orden cronológico (Regional at Best -> Clancy)

  if (error) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center p-10">
        <div className="text-red-500 font-mono border border-red-500/20 p-4 bg-red-500/5">
          [ERROR_LOG]: {error.message}
        </div>
      </main>
    )
  }

  // 3. Lógica para quitar álbumes duplicados basándonos en el slug
  const albums = Array.from(
    new Map(data?.map(a => [a.album_slug, a])).values()
  )

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-yellow-400 selection:text-black">
      <div className="max-w-7xl mx-auto p-8 md:p-16 lg:p-24">
        
        {/* Header Estilo Editorial */}
        <header className="mb-20 space-y-4">
          <div className="inline-block bg-yellow-400 text-black text-[10px] font-black uppercase px-2 py-0.5 tracking-[0.2em] mb-4">
            Digital Archive
          </div>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-600">
            Clique Vault
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl font-medium tracking-tight max-w-2xl border-l border-zinc-800 pl-6">
            A comprehensive Twenty One Pilots digital discography archive built for the Skeleton Clique.
          </p>
        </header>

        {/* Grid de Álbumes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-16">
          {albums.map((album) => {
            // Obtenemos la URL pública de la portada desde el storage
            const { data: cover } = supabase.storage
              .from('songs')
              .getPublicUrl(album.cover_path)

            return (
              <Link 
                key={album.album_slug} 
                href={`/album/${album.album_slug}`} 
                className="group relative flex flex-col"
              >
                {/* Contenedor de Imagen (Card) */}
                <div className="relative aspect-square overflow-hidden bg-zinc-900 shadow-2xl ring-1 ring-white/5 transition-all duration-700 group-hover:ring-white/20 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.07)]">
                  <Image
                    src={cover.publicUrl}
                    alt={album.album}
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  />
                  
                  {/* Overlay Gradiente al hacer Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
                      View Tracks
                    </span>
                  </div>
                </div>

                {/* Información del Álbum */}
                <div className="mt-6 space-y-1.5">
                  <h2 className="text-sm font-black uppercase tracking-widest truncate group-hover:text-yellow-400 transition-colors duration-300">
                    {album.album}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="h-[1px] w-4 bg-zinc-800 group-hover:w-8 group-hover:bg-yellow-400 transition-all duration-500"></span>
                    <p className="text-[10px] font-mono text-zinc-500 italic uppercase tracking-tighter">
                      Released {album.album_year}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer Sutil */}
      <footer className="max-w-7xl mx-auto p-8 md:p-16 border-t border-white/5 mt-20">
        <p className="text-zinc-700 text-[10px] font-mono uppercase tracking-[0.3em]">
          Stay Alive. ||-//
        </p>
      </footer>
    </main>
  )
}