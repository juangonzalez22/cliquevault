import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { Metadata } from 'next'

// 1. Definición de Tipos
interface Song {
  id: string
  title: string
  album: string
  album_year: number
  track_number: number
  audio_path: string
  cover_path: string
  album_slug: string
}

interface Props {
  params: Promise<{
    slug: string
  }>
}

// 2. Generación de Metadata Dinámica (Título de la pestaña)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const { data } = await supabase
    .from('songs')
    .select('album')
    .eq('album_slug', slug)
    .single()

  return {
    title: data ? `${data.album} | Clique Vault` : 'Álbum | Clique Vault',
    description: `Explora y escucha las canciones de ${data?.album || 'este álbum'} en Clique Vault.`,
  }
}

// 3. Componente Principal de la Página
export default async function AlbumPage({ params }: Props) {
  const { slug } = await params

  // Fetching de canciones desde la tabla 'songs'
  const { data: songs, error } = await supabase
    .from('songs')
    .select('*')
    .eq('album_slug', slug)
    .order('track_number', { ascending: true })

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-500 font-mono italic">Error: {error.message}</div>
      </main>
    )
  }

  if (!songs || songs.length === 0) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-500 font-mono italic">Álbum no encontrado</div>
      </main>
    )
  }

  const albumInfo = songs[0]
  const { data: coverData } = supabase.storage.from('songs').getPublicUrl(albumInfo.cover_path)

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 pb-20 selection:bg-yellow-400 selection:text-black">
      {/* Hero Section con Background Blur */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end p-8 md:p-16 overflow-hidden">
        {/* Capa de fondo desenfocada */}
        <div className="absolute inset-0 opacity-30 blur-[100px] scale-150 pointer-events-none">
          <Image 
            src={coverData.publicUrl} 
            alt="" 
            fill 
            className="object-cover" 
          />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-end max-w-6xl mx-auto w-full">
          {/* Portada del Álbum */}
          <div className="w-56 h-56 md:w-80 md:h-80 shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex-shrink-0 border border-white/10 group overflow-hidden">
            <Image 
              src={coverData.publicUrl} 
              alt={albumInfo.album} 
              width={400} 
              height={400} 
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" 
              priority 
            />
          </div>

          {/* Textos del Hero */}
          <div className="text-center md:text-left space-y-2">
            <p className="text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase text-yellow-400">
              Official Release
            </p>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
              {albumInfo.album}
            </h1>
            <p className="text-zinc-400 font-mono text-xs md:text-sm pt-2">
              YEAR: {albumInfo.album_year} • TRACKS: {songs.length}
            </p>
          </div>
        </div>
      </section>

      {/* Lista de Canciones */}
      <section className="max-w-5xl mx-auto mt-12 px-6">
        <div className="grid gap-1 border-t border-white/10 pt-8">
          {songs.map((song: Song) => {
            const { data: audioData } = supabase.storage.from('songs').getPublicUrl(song.audio_path)

            return (
              <div 
                key={song.id} 
                className="group flex items-center gap-4 md:gap-8 p-4 rounded-lg hover:bg-white/[0.04] transition-all duration-300 border border-transparent hover:border-white/5"
              >
                {/* Número de track */}
                <span className="text-zinc-600 font-mono text-xs w-6 text-right group-hover:text-yellow-400 transition-colors">
                  {String(song.track_number).padStart(2, '0')}
                </span>
                
                {/* Info de la canción + Audio */}
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="font-bold tracking-tight text-zinc-300 group-hover:text-white transition-colors">
                    {song.title}
                  </p>
                  
                  <audio 
                    controls 
                    src={audioData.publicUrl} 
                    className="h-8 w-full md:w-72 opacity-30 group-hover:opacity-100 transition-all duration-500 brightness-90 contrast-125 hover:scale-[1.02]"
                  />
                </div>

                {/* Botón de Descarga */}
                <a
                  href={audioData.publicUrl}
                  download={`${song.track_number} - ${song.title}.mp3`}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-yellow-400 transition-all transform hover:scale-125"
                  title="Descargar track"
                >
                  <DownloadIcon />
                </a>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

// Componente de Icono
function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" x2="12" y1="15" y2="3"/>
    </svg>
  )
}