import { usePathname } from "next/navigation";
import { GuildInfo, fetchGuild } from "@/server-side-api/discord/fetchGuild";
import { useContext, createContext, useState, useEffect } from "react";

const discordGuildInfo = createContext<{
    guild: GuildInfo | undefined;
    setCurrentGuild: (guild: GuildInfo) => void;
}>({
    guild: undefined,
    setCurrentGuild: () => {}
})

export const DiscordGuildInfoProvider = ({children}: { children: React.ReactNode }) => {
    const [guild, setGuild] = useState<GuildInfo | undefined>(undefined);
    const pathname = usePathname();

    useEffect(() => {
        if ( pathname.startsWith('/app/g/') ) {
            const guildId = pathname.split('/')[3];
            fetchGuild(guildId)
                .then((value) => {
                    if ( !value ) return window.location.replace('/app/guilds');
                    setGuild(value);
                })
                .catch(console.error);
        } else setGuild(undefined);
    }, [pathname]);
  
    const setCurrentGuild = (guild: GuildInfo | undefined) => {
        setGuild(guild);
    }

    return (
        <discordGuildInfo.Provider value={{ guild, setCurrentGuild }}>
            {children}
        </discordGuildInfo.Provider>
    )
}

export const useDiscordGuildInfo = () => useContext(discordGuildInfo);

export default discordGuildInfo;