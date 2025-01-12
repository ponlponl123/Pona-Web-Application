"use client";
import { Button } from '@nextui-org/react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'nextjs-toploader/app';
import type { Icon as IconType } from '@phosphor-icons/react';
import React, { useEffect, useRef, useState, useCallback } from 'react'

function ActivationLink({ href, children, icon, onClick, className }: { href?: string, children: React.ReactNode, icon?: IconType, onClick?: () => void, className?: string }) {
    const router = useRouter();
    const sections = useRef<NodeListOf<HTMLElement> | null>(null);
    const pathname = usePathname();
    const isSection = href?.startsWith('#');
    const app = document.querySelector('#app-content');
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const isHere = isSection ? activeSection === href?.substring(1) : pathname === href;
    const Icon = icon;
    const iconContent = Icon ? <Icon weight={isHere ? 'fill' : 'regular'} /> : null;

    const clicked = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isSection) {
            event.preventDefault();
            const sectionElement = document.querySelector(`#${href?.substring(1)}`);
            sectionElement?.scrollIntoView({behavior: 'smooth', block: 'nearest'});
        }
        if (onClick) onClick();
        if (!isSection && href) router.push(href);
    };

    const handleScroll = useCallback(() => {
        if (app) {
            const pageYOffset = app.scrollTop;
            let newActiveSection: string | null = null;

            sections.current?.forEach((section: HTMLElement) => {
                const sectionOffsetTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (pageYOffset >= sectionOffsetTop && pageYOffset < sectionOffsetTop + sectionHeight) {
                    newActiveSection = section.id;
                }
            });

            setActiveSection(newActiveSection);
        }
    }, []);

    useEffect(() => {
        if (isSection) {
            const app = document.querySelector('#app-content');
            if (app) {
                sections.current = document.querySelectorAll('[data-section]');
                app.addEventListener('scroll', handleScroll);

                return () => {
                    app.removeEventListener('scroll', handleScroll);
                };
            }
        }
    }, [isSection, handleScroll]);

    return (
        <Button onClick={clicked} className={className} color='primary' startContent={iconContent} variant={isHere ? 'flat' : 'light'} size='lg'>
            {children}
        </Button>
    );
}

export default ActivationLink;