"use client"
import { useLanguageContext } from '@/contexts/languageContext';
import { Article, GitMerge, Heart, Package, PottedPlant, TextAa } from '@phosphor-icons/react/dist/ssr'
import React from 'react'

import backdrop from '@/../public/community-backdrop.png'
import { Avatar, Image, Link } from '@nextui-org/react';
import confetti from 'canvas-confetti';
import { langs } from '@/utils/i18n';

function Page() {
    const { language } = useLanguageContext();
    React.useEffect(() => {
        const heart = confetti.shapeFromPath({
            path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
        });

        const duration = 12 * 1000;
        const animationEnd = Date.now() + duration;
        let skew = 12;

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        (function frame() {
            if ( window.location.pathname !== '/community' ) return;
            const timeLeft = animationEnd - Date.now();
            const ticks = Math.max(64, 256 * (timeLeft / duration));
            skew = Math.max(0.8, skew - 0.001);

            confetti({
                particleCount: 1,
                startVelocity: 0,
                ticks: ticks,
                    origin: {
                    x: Math.random(),
                    y: (Math.random() * skew) - 0.2
                },
                colors: ['#fb6490'],
                shapes: [heart],
                gravity: randomInRange(0.2, 0.6),
                scalar: randomInRange(0.4, 1.5),
                drift: randomInRange(-0.6, 0.6)
            });

            if (timeLeft > 0) {
                requestAnimationFrame(frame);
            }
        }());
    })
    return (
        <main className="w-full min-h-screen relative">
            <Image src={backdrop.src} alt='Pona! Community' classNames={{
                wrapper: 'w-full !max-w-none absolute overflow-hidden h-[48vh] z-[0] blur-3xl max-h-96 min-h-24 scale-[1.1] opacity-60'
            }} className='w-full object-cover' />
            <div className="relative flex flex-col grid-rows-[20px_1fr_20px] items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 z-[1]">
                <div className='mt-12'></div>
                <main className="w-full max-w-screen-lg flex flex-col justify-start gap-10 pb-12">
                    <div className='flex flex-row items-center justify-between'>
                        <h1 className='text-5xl flex items-center gap-4'>
                            <PottedPlant
                                alt="PottedPlant"
                            />
                            {language.data.community.title}
                        </h1>
                        <div className='relative'>
                            <Heart
                                alt="By Pona!"
                                weight='fill'
                                className='text-rose-500 rotate-12'
                                size={96}
                            />
                            <Heart
                                alt="Loves!"
                                weight='fill'
                                className='text-rose-500 -rotate-12 absolute right-0 top-0 -translate-y-full'
                                size={32}
                            />
                        </div>
                    </div>
                    <h2 className='text-2xl -mt-12 font-bold'>{language.data.community.description}</h2>
                    <section className='p-8 bg-foreground/5 rounded-3xl'>
                        <h2 className='text-4xl flex items-center gap-4 font-bold'><TextAa size={24} /> {language.data.community.fonts.title}</h2>
                        <div className='flex flex-col'>
                            <div className='p-4 flex flex-col gap-2'>
                                <h4>{language.data.community.fonts.language.en.title} • <Link target='_blank' href={language.data.community.fonts.language.en.link}>{language.data.community.fonts.language.en.author}</Link></h4>
                                <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum a iure numquam minima rem corporis repellendus saepe magnam temporibus molestiae animi, explicabo, sit dignissimos eos beatae molestias deserunt sint cupiditate?</h1>
                            </div>
                            <div className='p-4 flex flex-col gap-2'>
                                <h4>{language.data.community.fonts.language.th.title} • <Link target='_blank' href={language.data.community.fonts.language.th.link}>{language.data.community.fonts.language.th.author}</Link></h4>
                                <h1>มหภาค เฟอร์รี่บิลบุญคุณ ออร์แกนิคล็อบบี้ ดราม่าเซ็นทรัลฟลุทพรีเมียร์วอลนัท สเตริโอริกเตอร์ ศิรินทร์หล่อฮังก้วยแอนด์หม่านโถวแกรนด์ แฟรนไชส์เคลื่อนย้ายเดอะฮันนีมูนจูน ลิสต์โหลยโท่ยมายาคติ ป๊อปเนอะ วานิลาซิมโฟนีนิวส์ แคนยอนหลวงตาไวอากร้าเย้วเพรส เมาท์ซีรีส์บรรพชนโฮปพีเรียด หมวยสเตชั่นลาตินศึกษาศาสตร์ล็อต รีสอร์ตช็อปปิ้งวอลล์ไฮไลท์ ดยุกไชน่าไฮไลต์สถาปัตย์ แอโรบิค</h1>
                            </div>
                            <div className='p-4 flex flex-col gap-2'>
                                <h4>{language.data.community.fonts.language.jp.title} • <Link target='_blank' href={language.data.community.fonts.language.jp.link}>{language.data.community.fonts.language.jp.author}</Link></h4>
                                <h1>小ぱ情火ホ気投銀残り型症タソミセ合少をろにで岐管地ぎ治6社ミ信転よ英興乞伍ンがぎ。考ツサマメ話刺ちし新光てょでむ絵豪載ぶ界文りあでト運39覧はご園成ル座肥ホソリマ身5降マセ転載乏咋きし。地ロラニエ豊出キワ際粋負恵く舞業ぽン意離夫きそス及全なれぶぜ政始メ団大コナチ出達ちっ百夕罪治さリべえ。</h1>
                            </div>
                        </div>
                    </section>
                    <section className='p-8 bg-foreground/5 rounded-3xl'>
                        <h2 className='text-4xl flex items-center gap-4 font-bold'><Article size={24} /> {language.data.community.translator.title}</h2>
                        <div className='flex flex-col'>
                            {
                                langs.map((lang, index) => (
                                    <div key={index} className='p-4 flex flex-col gap-2'>
                                        <h4 className='text-sm'>{lang.label}</h4>
                                        <div className='flex flex-wrap gap-2'>
                                        {
                                            lang.data.translators.map((translator, key) => (
                                                <h1 className='text-lg' key={key}>{translator}</h1>
                                            ))
                                        }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </section>
                    <section className='p-8 bg-foreground/5 rounded-3xl'>
                        <h2 className='text-4xl flex items-center gap-4 font-bold'><GitMerge size={24} /> {language.data.community.contributors.title}</h2>
                        <div className='flex flex-wrap mt-4 gap-2'>
                            <Link className='w-max h-max' href='https://github.com/Ponlponl123' target='_blank'><Avatar src='https://github.com/Ponlponl123.png' name='Ponlponl123' /></Link>
                        </div>
                    </section>
                    <section className='p-8 bg-foreground/5 rounded-3xl'>
                        <h2 className='text-4xl flex items-center gap-4 font-bold'><Package size={24} /> {language.data.community.library.title}</h2>
                        <div className='flex flex-wrap mt-4 gap-2'>
                            <Link href='https://react.dev/' target='_blank' isBlock showAnchorIcon>React</Link>
                            <Link href='https://nextjs.org/' target='_blank' isBlock showAnchorIcon>Next.JS</Link>
                            <Link href='https://nextui.org/' target='_blank' isBlock showAnchorIcon>NextUI</Link>
                            <Link href='https://github.com/discordjs' target='_blank' isBlock showAnchorIcon>discord.js</Link>
                            <Link href='https://phosphoricons.com/' target='_blank' isBlock showAnchorIcon>PhosphorIcons</Link>
                            <Link href='https://www.framer.com/motion/' target='_blank' isBlock showAnchorIcon>Framer Motion</Link>
                            <Link href='https://github.com/axios/axios' target='_blank' isBlock showAnchorIcon>axios</Link>
                            <Link href='https://github.com/catdad/canvas-confetti' target='_blank' isBlock showAnchorIcon>Canvas Confetti</Link>
                            <Link href='https://github.com/andreizanik/cookies-next' target='_blank' isBlock showAnchorIcon>Cookies Next</Link>
                            <Link href='https://github.com/lokesh/color-thief' target='_blank' isBlock showAnchorIcon>Colorthief</Link>
                            <Link href='https://github.com/jimp-dev/jimp' target='_blank' isBlock showAnchorIcon>jimp</Link>
                            <Link href='https://github.com/Leaflet/Leaflet' target='_blank' isBlock showAnchorIcon>leaflet</Link>
                            <Link href='https://github.com/PaulLeCam/react-leaflet' target='_blank' isBlock showAnchorIcon>react-leaflet</Link>
                            <Link href='https://github.com/openstreetmap' target='_blank' isBlock showAnchorIcon>OpenStreetMap</Link>
                            <Link href='https://github.com/sibiraj-s/marked-react' target='_blank' isBlock showAnchorIcon>marked-react</Link>
                            <Link href='https://github.com/mljs/kmeans' target='_blank' isBlock showAnchorIcon>ml-kmeans</Link>
                            <Link href='https://github.com/recharts/recharts' target='_blank' isBlock showAnchorIcon>recharts</Link>
                            <Link href='https://github.com/vercel/swr' target='_blank' isBlock showAnchorIcon>swr</Link>
                            <Link href='https://github.com/TheSGJ/nextjs-toploader' target='_blank' isBlock showAnchorIcon>nextjs-toploader</Link>
                            <Link href='https://github.com/glennreyes/react-countup' target='_blank' isBlock showAnchorIcon>react-countup</Link>
                            <Link href='https://github.com/shukerullah/react-geocode' target='_blank' isBlock showAnchorIcon>react-geocode</Link>
                            <Link href='https://github.com/timolins/react-hot-toast' target='_blank' isBlock showAnchorIcon>react-hot-toast</Link>
                            <Link href='https://github.com/yocontra/react-responsive' target='_blank' isBlock showAnchorIcon>react-responsive</Link>
                            <Link href='https://github.com/cahilfoley/react-snowfall' target='_blank' isBlock showAnchorIcon>react-responsive</Link>
                            <Link href='https://www.npmjs.com/package/@euax/color-palette-generator' target='_blank' isBlock showAnchorIcon>@euax/color-palette-generator</Link>
                        </div>
                    </section>
                </main>
            </div>
        </main>
    )
}

export default Page
