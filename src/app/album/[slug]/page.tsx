import { supabase } from '@/lib/supabase'
import Image from 'next/image' // Importante para optimizar la portada

interface Song {
  id: string
  title: string
  album: string
  album_year: number
  track_number: number
  audio_path: string
  cover_path: string
}

interface Props {
  params: Promise<{
    slug: string
  }>
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params

  const { data: songs, error } = await supabase
    .from('songs')
    .select('*')
    .eq('album_slug', slug)
    .order('track_number', { ascending: true })

  if (error) return <div className="p-10 text-red-500">Error: {error.message}</div>
  if (!songs || songs.length === 0) return <div className="p-10">Álbum no encontrado</div>

  // Extraemos la info del álbum y la URL de la portada del primer registro
  const albumInfo = songs[0]
  const { data: coverData } = supabase.storage.from('songs').getPublicUrl(albumInfo.cover_path)

  // src/app/album/[slug]/page.tsx
// ... (mismo fetching de datos)

return (
  <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 pb-20">
    {/* Hero Section */}
    <div className="relative h-[40vh] md:h-[50vh] flex items-end p-8 md:p-16 overflow-hidden">
        {/* Fondo desenfocado para dar profundidad */}
        <div className="absolute inset-0 opacity-20 blur-3xl scale-150">
            <Image src={coverData.publicUrl} alt="" fill className="object-cover" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-end max-w-6xl mx-auto w-full">
            <div className="w-48 h-48 md:w-72 md:h-72 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex-shrink-0 border border-white/10">
                <Image src={coverData.publicUrl} alt={albumInfo.album} width={300} height={300} className="object-cover w-full h-full" priority />
            </div>
            <div className="text-center md:text-left">
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-yellow-400 mb-2">Long Play</p>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 uppercase italic">
                    {albumInfo.album}
                </h1>
                <p className="text-zinc-400 font-mono text-sm">RELEASED IN {albumInfo.album_year} • {songs.length} TRACKS</p>
            </div>
        </div>
    </div>

    {/* Tracks List */}
    <div className="max-w-4xl mx-auto mt-12 px-6">
      <div className="grid gap-1 border-t border-white/5 pt-8">
        {songs.map((song: Song) => {
          const { data: audioData } = supabase.storage.from('songs').getPublicUrl(song.audio_path)

          return (
            <div key={song.id} className="group flex items-center gap-6 p-4 rounded-lg hover:bg-white/[0.03] transition-all duration-300">
              <span className="text-zinc-600 font-mono text-xs w-4 group-hover:text-yellow-400">
                {String(song.track_number).padStart(2, '0')}
              </span>
              
              <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="font-semibold tracking-tight text-zinc-200 group-hover:text-white transition-colors">
                    {song.title}
                </p>
                
                <audio 
                  controls 
                  src={audioData.publicUrl} 
                  className="h-7 w-full md:w-64 opacity-20 group-hover:opacity-100 transition-all duration-500 brightness-75 contrast-125"
                />
              </div>

              <a
                href={audioData.publicUrl}
                download={`${song.track_number} - ${song.title}.mp3`}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-white transition-all transform hover:scale-110"
              >
                <DownloadIcon />
              </a>
            </div>
          )
        })}
      </div>
    </div>
  </main>
)
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
  )
}