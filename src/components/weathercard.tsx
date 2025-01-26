import { useLanguageContext } from '@/contexts/languageContext';
import { useUserSettingContext } from '@/contexts/userSettingContext';
import { WMO_CODES_ICONS } from '@/data/wmo-code-icons';
import { Spinner } from '@nextui-org/react';
import { Icon as IconType, IconProps } from '@phosphor-icons/react';
import { ArrowDown, ArrowUp, MapPinArea, Question } from '@phosphor-icons/react/dist/ssr';
import React from 'react'

export type TemperatureUnit = "°C" | "°F";

export interface WeatherData {
  "latitude": number,
  "longitude": number,
  "generationtime_ms": number,
  "utc_offset_seconds": number,
  "timezone": string,
  "timezone_abbreviation": string,
  "elevation": number,
  "current_units": {
      "time": string,
      "interval": string,
      "temperature_2m": TemperatureUnit,
      "weather_code": string
  },
  "current": {
      "time": number,
      "interval": number,
      "temperature_2m": number,
      "weather_code": number
  },
  "daily_units": {
      "time": string,
      "weather_code": string,
      "temperature_2m_max": TemperatureUnit,
      "temperature_2m_min": TemperatureUnit,
      "sunset": string
  },
  "daily": {
      "time": number[],
      "weather_code": number[],
      "temperature_2m_max": number[],
      "temperature_2m_min": number[],
      "sunset": number[]
  }
}

export interface ResponseData {
  source: string;
  geo_source?: string;
  country: string;
  address: string;
  state: string;
  city: string;
  data: WeatherData;
}

const WeatherCard: React.FC = () => {
  const { language } = useLanguageContext();
  const { userSetting } = useUserSettingContext();
  const [ weatherData, setWeatherData ] = React.useState<ResponseData | null>(null);

  React.useEffect(() => {
    (async () => {
      let lat = 0;
      let lng = 0;
      if ( userSetting.location === 'auto' ) {
        // get latitude and longitude from ip address
        await fetch('https://ipapi.co/json/')
          .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
          .then(data => {
              lat = data.latitude;
              lng = data.longitude;
            })
          .catch(error => {
              console.error('There has been a problem with your fetch operation:', error);
            });
  
        // navigator.geolocation.getCurrentPosition(async (position) => {
        //   lat = position.coords.latitude;
        //   lng = position.coords.longitude;
        // });
        // // Handle error
        // navigator.geolocation.getCurrentPosition(
        //   () => {},
        //   (error: GeolocationPositionError) => {
        //     if (error.code === error.PERMISSION_DENIED) {
        //       console.log('User denied the request for Geolocation.');
        //     } else if (error.code === error.POSITION_UNAVAILABLE) {
        //       console.log('Location information is unavailable.');
        //     } else if (error.code === error.TIMEOUT) {
        //       console.log('The request to get user location timed out.');
        //     } else {
        //       console.log('An unknown error occurred.', error);
        //     }
        //   }
        // );
        // // Fallback to default location if autolocation fails
        // lat = 37.7749; // Default latitude
        // lng = -122.4194; // Default longitude
      } else if ( userSetting.location === 'surprise' ) {
        lat = Math.random() * (90 - (-90)) + (-90);
        lng = Math.random() * (180 - (-180)) + (-180);
      } else if ( typeof userSetting.location === 'object' && 'lat' in userSetting.location && 'lng' in userSetting.location ) {
        lat = userSetting.location.lat;
        lng = userSetting.location.lng;
      }
      
      const response = await fetch(`/api/weather/${lat}/${lng}${userSetting.thermometer==='f'?'?tmp_unit=fahrenheit':''}`);
      const data = await response.json();
      if (response.ok && data.data) setWeatherData(data as ResponseData);
    })()
  }, [userSetting])

  const WeatherIcon: React.FC<IconProps> = (weatherData && weatherData.data.daily.weather_code[1]) ? WMO_CODES_ICONS["wmo-code"][weatherData.data.daily.weather_code[1]] : Question;
  const diffTemp = (weatherData?.data.current.temperature_2m ?? 0) - (weatherData?.data.daily.temperature_2m_max[1] ?? 0);

  return (
    <div className='wheather-card w-full lg:max-w-sm p-6 rounded-3xl flex flex-col gap-3 bg-gradient-to-br from-primary-50/10 to-primary-300/10 shadow-2xl shadow-primary-300/10'>
      {
        weatherData ?
        <>
          <div className='flex gap-4 items-center justify-between'>
            <div className='flex items-center justify-center gap-4'>
              <WeatherIcon weight='fill' size={64} />
              <div className='flex flex-col'>
                <h1 className='text-3xl'>{weatherData?.data.current.temperature_2m} °</h1>
                <h3 className='flex text-sm gap-1 items-center'><MapPinArea weight='fill' /> {
                  (weatherData && (
                    (weatherData.city || weatherData.state) && weatherData.country
                  )) ? `${weatherData?.city || weatherData?.state}, ${weatherData.country}` :
                  (weatherData && (
                    !(weatherData.city || weatherData.state) && weatherData.country
                  )) ? weatherData.country :
                  (weatherData && (
                    (weatherData.city || weatherData.state) && !weatherData.country
                  )) ? `${weatherData?.city || weatherData?.state}` : weatherData.address
                }</h3>
              </div>
            </div>
            <div className='flex flex-col items-end justify-center gap-1'>
              <h1 className='text-sm'>{language.data.app.home.weather.status['wmo-code'][weatherData?.data.daily.weather_code[1] as unknown as keyof typeof language.data.app.home.weather.status['wmo-code']]}</h1>
              <h3 className='flex text-sm gap-1 items-center'>
                <span className='flex items-center'><ArrowUp /> {weatherData?.data.daily.temperature_2m_max[1]}</span>
                /
                <span className='flex items-center'><ArrowDown /> {weatherData?.data.daily.temperature_2m_min[1]}</span>
              </h3>
            </div>
          </div>
          <div className='w-full h-px bg-foreground/10'></div>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col'>
              <h2 className='text-sm text-foreground/60'>{language.data.app.home.weather.today_temp}</h2>
              <h1 className='font-bold text-base'>{
                (diffTemp >= 0 && diffTemp <= 1.5) ?
                  language.data.app.home.weather.temp_status.little_higher_than_yesterday
                : (diffTemp >= -1.5 && diffTemp <= 0) ?
                  language.data.app.home.weather.temp_status.little_lower_than_yesterday
                : (diffTemp <= -1.5 && diffTemp <= 0) ?
                  language.data.app.home.weather.temp_status.lower_than_yesterday
                : (diffTemp >= 1.5 && diffTemp >= 0) ?
                  language.data.app.home.weather.temp_status.higher_than_yesterday
                : language.data.app.home.weather.temp_status.like_yesterday
              }</h1>
            </div>
            <div className='flex flex-col'>
              <h2 className='text-sm text-foreground/60'>{language.data.app.home.weather.dontmisssunset}</h2>
              <h1 className='font-bold text-base'>{language.data.app.home.weather.sunsetwillbeat} {
                userSetting.timeformat === 12 ?
                  weatherData?.data.daily.sunset[1] ? new Date(weatherData.data.daily.sunset[1]).toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit', hour12: true }) : 'N/A'
                : weatherData?.data.daily.sunset[1] ? new Date(weatherData.data.daily.sunset[1]).toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit', hour12: false }) : 'N/A'
              }</h1>
            </div>
          </div>
        </>
        :
        <>
          <div className='w-full h-full flex flex-col justify-center items-center m-auto gap-3 my-24'>
            <Spinner color='current' />
          </div>
        </>
      }
    </div>
  )
}

export default WeatherCard