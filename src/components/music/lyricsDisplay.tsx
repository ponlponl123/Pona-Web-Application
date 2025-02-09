import { useState, useEffect, useRef } from "react";

interface Lyric {
    seconds: number;
    lyrics: string;
}

interface Track {
    lyrics?: Lyric[];
}

interface LyricsDisplayProps {
    currentTrack?: Track;
    playerPosition: number;
    lyricsProvider: HTMLElement;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ currentTrack, playerPosition, lyricsProvider }) => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const lyricsContainerRef = useRef<HTMLElement>(lyricsProvider);

    useEffect(() => {
        if (!currentTrack?.lyrics || currentTrack.lyrics.length === 0) return;

        const newIndex = currentTrack.lyrics.findIndex((lyrics, index) => {
            const nextLyrics = currentTrack.lyrics?.[index + 1];
            return (
                playerPosition >= lyrics.seconds * 1000 &&
                (!nextLyrics || playerPosition < nextLyrics.seconds * 1000)
            );
        });

        if (newIndex !== -1) setActiveIndex(newIndex);
    }, [playerPosition, currentTrack]);

    // Auto-scroll to active lyrics
    useEffect(() => {
        if (!lyricsContainerRef.current) return;

        const activeLyric = document.getElementById(`lyrics-index-${activeIndex}`);
        if (activeLyric) {
            lyricsContainerRef.current.scrollTo({
                top: activeLyric.offsetTop - lyricsContainerRef.current.clientHeight / 2,
                behavior: "smooth",
            });
        }
    }, [activeIndex]);

    if (!currentTrack?.lyrics || currentTrack.lyrics.length === 0) {
        return <div className="text-center text-foreground/40">No lyrics available</div>;
    }

    return (
        <div className="w-full text-center">
            {currentTrack.lyrics.map((lyrics, index) => (
                <div
                    key={index}
                    id={`lyrics-index-${index}`}
                    className={`w-full h-max flex items-center text-start justify-between px-2.5 my-8 transition-all duration-500 ${
                        index === activeIndex ? "text-2xl text-foreground font-bold" :
                        index < activeIndex ? "text-lg text-foreground/60" :
                        "text-lg text-foreground/40"
                    }`}
                >
                    {lyrics.lyrics}
                </div>
            ))}
        </div>
    );
};

export default LyricsDisplay;
