"use server";
import axios from 'axios';
import { EndpointHTTP, EndpointKey } from '../endpoint';
import { default_data } from '@/data/guild/stats';

type chennelid = {
  [key: string]: number;
}

interface Period {
  start_time: string;
  end_time: string;
}
interface Interval {
  date: string;
  played: number;
}

interface DatasetItem {
  from: string;
  to: string;
  channels: { id: string | null; name: string | null; members: string[] | null }[];
}

interface ChartItem {
  date: string;
  channels: chennelid
}

function calculateActiveIntervals(rawData: Period[], mydata: Interval[]): Interval[] {
  rawData.forEach((period: Period) => {
    const start = new Date(period.start_time);
    const end = new Date(period.end_time);

    mydata.forEach((interval: Interval) => {
      const intervalHour = parseInt(interval.date.split(":")[0]);
      const intervalStart = new Date(start);
      intervalStart.setUTCHours(intervalHour, 0, 0, 0);
      const intervalEnd = new Date(intervalStart.getTime() + 3 * 60 * 60 * 1000);

      const activeStart = start > intervalStart ? start : intervalStart;
      const activeEnd = end < intervalEnd ? end : intervalEnd;

      if (activeStart < activeEnd) {
        const activeTime = (activeEnd.getTime() - activeStart.getTime()) / (60 * 1000); // Convert to minutes
        interval.played += Math.round(activeTime);
      }
    });
  });

  return mydata;
}

function generateAllTimestamps(): string[] {
  const timestamps: string[] = [];
  for (let hour = 0; hour < 24; hour += 3) {
    const from = `${hour.toString().padStart(2, '0')}:00`;
    const toHour = (hour + 2) % 24;
    const toMinute = 59;
    const to = `${toHour.toString().padStart(2, '0')}:${toMinute.toString().padStart(2, '0')}`;
    timestamps.push(`${from} - ${to}`);
  }
  return timestamps;
}

function convertToChartFormat(dataset: DatasetItem[]): ChartItem[] {
  const allTimestamps = generateAllTimestamps();

  const chartItems: ChartItem[] = allTimestamps.map((timestamp) => ({
    date: timestamp,
    channels: {}
  }));

  // Populate channels data
  dataset.forEach((item) => {
    const fromHour = parseInt(item.from.split(":")[0]);
    const toHour = (fromHour + 2) % 24;
    const toMinute = 59;
    const timestamp = `${item.from} - ${toHour.toString().padStart(2, '0')}:${toMinute.toString().padStart(2, '0')}`;
    const chartItem = chartItems.find((ci) => ci.date === timestamp);

    if (chartItem) {
      item.channels.forEach((channel) => {
        if (channel.name) {
          chartItem.channels[channel.name] = channel.members?.length || 0;
        }
      });
    }
  });

  return chartItems;
}

export default async function guild_stats(guildid: string): Promise<string | null> {
    try {
        const Req = await axios.get(`${EndpointHTTP}/v1/guild/${guildid}/stats`, {
          headers: {
            'Authorization': `Pona! ${EndpointKey}`,
            'Content-Type': 'application/json',
            "User-Agent": "Pona! Application (OpenPonlponl123.com/v1)"
          }
        });
        if ( Req.status === 200 && Req.data.active ) {
          const averageUsage = calculateActiveIntervals(Req.data.active, default_data as Interval[]);
          const membersInChannel = convertToChartFormat(Req.data.history as DatasetItem[]);
          return JSON.stringify({active: averageUsage, members: membersInChannel});
        }
        return null;
    } catch (err) {
        console.error('Failed to get Guild Active Usage Stats:', err);
        return null;
    }
}