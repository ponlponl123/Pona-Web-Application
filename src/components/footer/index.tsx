import React from 'react'
import { GithubLogo, Atom, Bird, Cube, Gavel } from "@phosphor-icons/react/dist/ssr";
import Link from 'next/link';

function Footer() {
  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center h-24 -mt-24">
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://github.com/ponlponl123/Pona-Discord-Application"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GithubLogo
          alt="Github icon"
        />
        Github
      </Link>
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://github.com/ponlponl123/Pona-Discord-Application/tree/main/docs"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Atom
          alt="Atom"
        />
        API Docs
      </Link>
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://ponlponl123.com/discord"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Bird
          alt="Bird"
        />
        Support
      </Link>
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="/status"
        rel="noopener noreferrer"
      >
        <Cube
          alt="Cube"
        />
        Pona! Status
      </Link>
      <Link
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://law.ponlponl123.com/pona"
        rel="noopener noreferrer"
      >
        <Gavel
          alt="Gavel"
        />
        Legal
      </Link>
    </footer>
  )
}

export default Footer