import React from 'react'
import { Track } from '@/interfaces/ponaPlayer'

function MusicCard({track}: {track: Track}) {
  return (
    <div className='music-card' aria-label={track.title}>
        <div className=''>

        </div>
    </div>
  )
}

export default MusicCard