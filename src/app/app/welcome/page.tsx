"use client";
import React from 'react';
import confetti from 'canvas-confetti';
import MyButton from '@/components/button';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useRouter } from 'next/navigation';

function Page() {
    const router = useRouter();
    const { userInfo } = useDiscordUserInfo();

    React.useEffect(() => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number): number {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }, [])

    return (
        <main id='app-panel'>
            <div className='min-h-36 max-h-96 h-screen w-full'><div className='absolute w-full min-h-36 max-h-96 h-screen top-0 left-0 welcome-banner'></div></div>
            <main id='app-workspace' className='max-w-screen-xl mx-auto flex flex-col items-center'>
                <h1 className='text-6xl -mt-12 text-center' style={{lineHeight: '74px'}}>👋 Hello {userInfo?.global_name}!,<br/>Welcome to the Pona Web Application!</h1><br />
                <MyButton onClick={()=>router.push('/app')} className='m-auto'>Get started</MyButton>
            </main>
        </main>
    )
}

export default Page