"use client";
import React from 'react'
import { authorizeUserAccessToken } from '@/server-side-api/discord/fetchUser';
import { MagicWand, Confetti } from '@phosphor-icons/react/dist/ssr';
import { useLanguageContext } from '@/contexts/languageContext';
import { useSearchParams } from 'next/navigation'
import { Spinner } from "@nextui-org/spinner";
import MyButton from '@/components/button';
import { setCookie } from 'cookies-next';
import confetti from 'canvas-confetti';
import Link from 'next/link';

function Authorize() {
    const params = useSearchParams();
    const code = params.get('code');
    const redirectFrom = params.get('from');
    const { language } = useLanguageContext();
    const initialized = React.useRef<boolean>(false);
    const confetti_colors = React.useRef<string[]>(['#ff69b4', '#ff8c00', '#90ee90', '#3cb371', '#008000', '#00ffff', '#4169e1', '#8a2be2', '#a52a2a', '#deb887', '#ffdead', '#f5f5f5', '#ffffff']);
    const [authenticatedState, setAuthenticatedState] = React.useState<'success' | 'processing' | 'failed' | 'unknown'>('processing');

    React.useEffect(() => {
        if ( !initialized.current ) {
            initialized.current = true
            if ( code && code.length > 0 ) {
                async function auth(code: string) {
                    const authorized = await authorizeUserAccessToken(code, redirectFrom ? 'invite' : 'auth_only');
                    if ( authorized ) {
                        setAuthenticatedState('success');
                        setCookie('LOGIN_', authorized.key);
                        setCookie('LOGIN_TYPE_', authorized.type);
                    } else setAuthenticatedState('failed');
                }
                auth(code as string);
            } else setAuthenticatedState('unknown');
        }
    }, [code, redirectFrom])

    return (
        authenticatedState === 'success' ? (
            <>
                <Confetti size={48} id='confettieffectorigin' ref={confettiElement => {
                    const boundingClientRect = confettiElement?.getBoundingClientRect();
                    if ( boundingClientRect ) {
                        const originX = (boundingClientRect.left + (0.5 * boundingClientRect.width)) / window.innerWidth;
                        const originY = (boundingClientRect.top + (0.5 * boundingClientRect.height)) / window.innerHeight;
                        confetti({
                            origin: {
                                x: originX,
                                y: originY
                            },
                            particleCount: 64,
                            decay: 0.86,
                            ticks: 200,
                            spread: 80,
                            angle: 45,
                            colors: confetti_colors.current
                        })?.then(() => {
                            if ( redirectFrom === 'invite' ) {
                                window.location.replace('/app/welcome');
                            } else {
                                window.location.replace('/app');
                            }
                        })
                    }
                }}/>
                <strong className='text-3xl'>{language.data.callback.success.title}</strong>
                <p className='text-xl'>{language.data.callback.success.description}</p>
            </>
        ) : authenticatedState === 'processing' ? (
            <>
                <MagicWand size={48} />
                <strong className='text-3xl'>{language.data.callback.processing.title}</strong>
                <p className='text-xl'>{language.data.callback.processing.description}</p>
                <br/>
                <Spinner color='current' />
            </>
        ) : authenticatedState === 'failed' ? (
            <>
                <strong className='text-3xl'>{language.data.callback.failed.title}</strong>
                <p className='text-xl'>{language.data.callback.failed.description}</p>
                <br/>
                <Link href='/app'>
                    <MyButton>{language.data.callback.failed.actions.tryagain}</MyButton>
                </Link>
            </>
        ) : (
            <>
                <strong className='text-3xl'>{language.data.callback.unknown.title}</strong>
                <p className='text-xl'>{language.data.callback.unknown.description}</p>
            </>
        )
    )
}

export default Authorize