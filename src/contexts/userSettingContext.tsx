"use client";
import React, { createContext, useContext, useState } from 'react';
import { getCookie, setCookie } from 'cookies-next';
import { LatLngExpression } from 'leaflet';

export type TimeFormat = 'auto' | 12 | 24;
export type Thermometer = 'c' | 'f';
export type Animation = boolean | '30 fps';
export type Location = 'auto' | 'surprise' | LatLngExpression;
export interface UserSetting {
  // Layout Settings
  timeformat?: TimeFormat;
  thermometer?: Thermometer;
  animation?: Animation;
  // Privacy Settings
  location?: Location;
}
export const defaultUserSetting: UserSetting = {
  timeformat: 'auto',
  thermometer: 'c',
  animation: true,
  location: 'auto',
}

const UserSettingContext = createContext<{
  userSetting: UserSetting;
  setUserSetting: (setting: UserSetting) => void;
}>({
  userSetting: defaultUserSetting,
  setUserSetting: () => {},
});

export const UserSettingProvider = ({ children }: { children: React.ReactNode }) => {
  const [userSetting, setUserSettingState] = useState<UserSetting>({});

  React.useEffect(() => {
    const userSettingFromCookie = getCookie('USR');
    if ( userSettingFromCookie ) {
      const decodedSetting = atob(userSettingFromCookie || '');
      if (decodedSetting) {
        setUserSettingState(JSON.parse(decodedSetting));
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
