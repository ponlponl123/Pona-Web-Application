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
    const app = useRef<HTMLElement | null>(null);
    const button = useRef<HTMLButtonElement | null>(null);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [activeSectionGroup, setActiveSectionGroup] = useState<boolean>(false);
    const isHere = ((isSection ? (activeSectionGroup || activeSection === href?.substring(1)) : pathname === href) || activeSectionGroup);
    const Icon = icon;
    const iconContent = Icon ? <Icon weight={isHere ? 'fill' : 'regular'} /> : null;
    const hrefIndex = href ? href.split('/') : [];

    console.log(href, activeSectionGroup)
    
    const clicked = () => {
        if (isSection) {
            const sectionElement = document.querySelector(`#${href?.substring(1)}`);
            if (sectionElement && app.current) {
                const appTop = app.current.getBoundingClientRect().top;
                const offset = sectionElement.id.match(/(-)/g) ? 156 : 96;
                const sectionTop = sectionElement.getBoundingClientRect().top - offset;
                app.current.scrollTo({
                    top: sectionTop - appTop + app.current.scrollTop,
                    behavior: 'smooth'
                });
            }
        }
        if (onClick) onClick();
        if (!isSection && href) router.push(href);
    }

    const handleScroll = useCallback(() => {
        if (app.current) {
            const pageYOffset = app.current.scrollTop;
            let newActiveSection: string | null = null;

            sections.current?.forEach((section: HTMLElement) => {
                const sectionOffsetTop = section.offsetTop - 256;
                const sectionHeight = section.offsetHeight;

                if (pageYOffset >= sectionOffsetTop && pageYOffset < sectionOffsetTop + sectionHeight) {
                    newActiveSection = section.id;
                }
            });

            setActiveSection(() => {
                if ( button.current?.parentElement && button.current.parentElement?.parentElement && button.current.parentElement.parentElement.classList.contains('group-menu') ) {
                    if (String(newActiveSection).split('-')[0] === href?.substring(1).split('-')[0])
                    {
                        button.current.parentElement.parentElement.classList.add('active');
                        if ( !href.match(/(-)/g) ) setActiveSectionGroup(true);
                        else setActiveSectionGroup(false);
                    }
                    else
                    {
                        button.current.parentElement.parentElement.classList.remove('active');
                        if ( !href?.match(/(-)/g) ) setActiveSectionGroup(false);
                    }
                }
                return newActiveSection;
            });
        }
    }, [href]);

    useEffect(() => {
        if (isSection) {
            app.current = document.querySelector('#app-content');
            if (app.current) {
                sections.current = document.querySelectorAll('[data-section]');
                app.current.addEventListener('scroll', handleScroll);

                handleScroll();

                return () => {
                    app.current?.removeEventListener('scroll', handleScroll);
                }
            }
        }
        else if ( href && button.current?.parentElement && button.current.parentElement?.parentElement && button.current.parentElement.parentElement.classList.contains('group-menu') )
        {
            const group = button.current.parentElement.parentElement;
            if ( !group ) return;
            const controlby = group.getAttribute('aria-label');
            const parentPathname = hrefIndex.map((text, index) => {
                if ( index === 0 ) return text;
                else if ( (index === hrefIndex.length - 1) && href.includes('player') && !href.endsWith('player') ) return;
                else return `/${text.toLowerCase()}`;
            }).join('').replace(',','');
            if ( href.includes('player') ) console.log(parentPathname)
            if (controlby && pathname.includes(controlby))
            {
                button.current.parentElement.parentElement.classList.add('active');
                if ( href === controlby ) setActiveSectionGroup(true);
                else setActiveSectionGroup(false);
            }
            else if (pathname.includes(parentPathname))
            {
                button.current.parentElement.parentElement.classList.add('active');
                if ( href === parentPathname ) setActiveSectionGroup(true);
                else setActiveSectionGroup(false);
            }
            else
            {
                button.current.parentElement.parentElement.classList.remove('active');
                if ( href === controlby || href === parentPathname ) setActiveSectionGroup(false);
            }
        }
    }, [isSection, handleScroll, href, hrefIndex, pathname]);

    return (
        <Button onClick={clicked} ref={button} className={className} color='primary' startContent={iconContent} variant={isHere ? 'flat' : 'light'} size='lg'>
            {children}
        </Button>
    );
}

export default ActivationLink;