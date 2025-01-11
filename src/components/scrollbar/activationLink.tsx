"use client";
import { Button } from '@nextui-org/react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'nextjs-toploader/app';
import type { Icon as IconType } from '@phosphor-icons/react';
import React from 'react'

function ActivationLink({ href, children, icon, onClick, className }: { href?: string, children: React.ReactNode, icon?: IconType, onClick?: () => void, className?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const isHere = (pathname === href);
    const Icon = icon;
    const iconContent = Icon ? <Icon weight={isHere ? 'fill' : 'regular'} /> : null;
    const clicked = () => {
        if (onClick) onClick();
        if (href) router.push(href);
    }
    return (
        <Button onClick={clicked} className={className} startContent={iconContent} variant={isHere ? 'flat' : 'light'} size='lg'>{children}</Button>
    )
}

export default ActivationLink