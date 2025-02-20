"use client"
import React from 'react'

function Page() {
  React.useEffect(() => {
    window.location.href = window.location.href.replace('/player/artist', '/player/c');
  })
  return (<></>)
}

export default Page