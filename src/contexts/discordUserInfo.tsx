'use client';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import {
  UserInfo as UserInfoType,
  fetchByAccessToken,
  revokeUserAccessToken as removeAccessToken,
} from '@/server-side-api/discord/fetchUser';
import { useContext, createContext, useState, useEffect } from 'react';

const discordUserInfo = createContext<{
  userInfo: UserInfoType | null;
  setUserAccessToken: (key: string, type: string) => void;
  revokeUserAccessToken: (key: string) => void;
  loading: boolean;
}>({
  userInfo: null,
  setUserAccessToken: () => {},
  revokeUserAccessToken: () => {},
  loading: true,
});

export const DiscordUserInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userInfo, setUserInfo] = useState<UserInfoType | null>(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const currentAccessToken = getCookie('LOGIN_');
    const currentAccessTokenType = getCookie('LOGIN_TYPE_');
    if (
      currentAccessToken &&
      currentAccessTokenType &&
      currentAccessToken !== 'false'
    )
      setUserAccInfo(currentAccessToken, currentAccessTokenType);
    else setLoading(false);
  }, []);
  const setUserAccessToken = async (key: string, type: string) => {
    setCookie('LOGIN_', key);
    setCookie('LOGIN_TYPE_', type);
    setUserAccInfo(key, type);
  };

  const setUserAccInfo = async (key: string, keyType: string) => {
    const fetchUser = await fetchByAccessToken(key, keyType);
    if (fetchUser) setUserInfo(fetchUser);
    setLoading(false);
  };

  const revokeUserAccessToken = async (key: string) => {
    await removeAccessToken(key);
    deleteCookie('LOGIN_');
    deleteCookie('LOGIN_TYPE_');
    window.location.replace('/');
  };

  return (
    <discordUserInfo.Provider
      value={{ userInfo, setUserAccessToken, revokeUserAccessToken, loading }}
    >
      {children}
    </discordUserInfo.Provider>
  );
};

export const useDiscordUserInfo = () => useContext(discordUserInfo);

export default discordUserInfo;
