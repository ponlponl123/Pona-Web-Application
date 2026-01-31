'use client';
import { getCookie, setCookie } from 'cookies-next';
import { LatLngExpression } from 'leaflet';
import React, { createContext, useContext, useState } from 'react';

export type TimeFormat = 'auto' | 12 | 24;
export type Thermometer = 'c' | 'f';
export type Animation = boolean | '30 fps';
export type Location = 'auto' | 'surprise' | LatLngExpression;
export type PonaPlayerStyle = 'modern' | 'compact';
export interface UserSetting {
  // Layout Settings
  transparency?: boolean;
  timeformat?: TimeFormat;
  thermometer?: Thermometer;
  animation?: Animation;
  // Privacy Settings
  location?: Location;
  dev_pona_player_style?: PonaPlayerStyle;
}
export const defaultUserSetting: UserSetting = {
  transparency: true,
  timeformat: 'auto',
  thermometer: 'c',
  animation: true,
  location: 'auto',
  dev_pona_player_style: 'compact',
};

const UserSettingContext = createContext<{
  userSetting: UserSetting;
  setUserSetting: (setting: UserSetting) => void;
}>({
  userSetting: defaultUserSetting,
  setUserSetting: () => {},
});

export const UserSettingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userSetting, setUserSettingState] = useState<UserSetting>({});

  React.useEffect(() => {
    const userSettingFromCookie = getCookie('USR');
    if (userSettingFromCookie) {
      const cookieValue =
        typeof userSettingFromCookie === 'string' ? userSettingFromCookie : '';
      const decodedSetting = atob(cookieValue);
      if (decodedSetting) {
        const parsedUserSetting = JSON.parse(decodedSetting) as UserSetting;
        setUserSettingState(parsedUserSetting);
        if (parsedUserSetting.animation === '30 fps')
          document.documentElement.classList.add('animation-30fps');
        else if (parsedUserSetting.animation === false)
          document.documentElement.classList.remove('animation-disabled');
      }
    } else setUserSettingState(defaultUserSetting);
  }, [setUserSettingState]);

  const setUserSetting = (setting: UserSetting) => {
    const encodedSetting = btoa(JSON.stringify(setting));
    setCookie('USR', encodedSetting, {
      expires: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000), // expires in 90 days
    });
    setUserSettingState(setting);
  };

  return (
    <UserSettingContext.Provider value={{ userSetting, setUserSetting }}>
      {children}
    </UserSettingContext.Provider>
  );
};

export const useUserSettingContext = () => useContext(UserSettingContext);

export default UserSettingContext;
