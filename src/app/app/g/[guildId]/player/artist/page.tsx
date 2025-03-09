"use client"
import React from 'react'
import { useRouter } from 'next/navigation';

function Page() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace(window.location.href.replace('/player/artist', '/player/c'));
  })
  return (<></>)
}

export default Page