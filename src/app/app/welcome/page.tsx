"use client";
import React from 'react';
import confetti from 'canvas-confetti';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';

function Page() {
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
        <main>
            <div className='min-h-36 max-h-96 h-screen w-full'><div className='absolute w-full min-h-36 max-h-96 h-screen top-0 left-0 welcome-banner'></div></div>
            <h1 className='text-3xl'>👋 Hello {userInfo?.global_name}!, Welcome to the Pona Web Application!</h1><br />
            <p>This is a sample page for your Pona application.</p>
            <p>Feel free to customize and build upon this page as needed.</p>
        </main>
    )
}

export default Page