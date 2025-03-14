import React from 'react'

function Equalizing({ className, steps = 3 }: { className?: string; steps?: number; }) {
  return (
    <div className={className + ' aspect-square w-full h-full flex flex-row justify-center items-end px-3 py-4 gap-1'}>
      {
        new Array(steps).fill(0).map((_,i) => (
          <div key={i} style={{ animationDelay: `${0.12 * i}s` }} className={`aspect-square__inner animate equalizer w-[2px] rounded-full h-1/2 bg-white`}></div>
        ))
      }
    </div>
  )
}

export default Equalizing