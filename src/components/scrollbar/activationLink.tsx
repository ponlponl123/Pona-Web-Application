"use client";
import { Button } from '@nextui-org/react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'nextjs-toploader/app';
import React from 'react'

function ActivationLink({ href, children }: { href: string, children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const isHere = (pathname === href);
    return (
        <Button onClick={()=>router.push(href)} variant={isHere ? 'solid' : 'light'} size='lg'>{children}</Button>
    )
}

export default ActivationLink