'use server';
import axios from 'axios';
import { EndpointHTTP, EndpointKey } from '../endpoint';
import { fetchGuild } from '../discord/fetchGuild';

type chennelid = {
  [key: string]: number;
};

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
  channels: {
    id: string | null;
    name: string | null;
    members: string[] | null;
  }[];
}

interface ChartItem {
  date: string;
  channels: chennelid;
}

function calculateActiveIntervals(rawData: Period[]): Interval[] {
  const data = [
    {
      date: '00:00 - 02:59',
      played: 0,
    },
    {
      date: '03:00 - 05:59',
      played: 0,
    },
    {
      date: '06:00 - 08:59',
      played: 0,
    },
    {
      date: '09:00 - 11:59',
      played: 0,
    },
    {
      date: '12:00 - 14:59',
      played: 0,
    },
    {
      date: '15:00 - 17:59',
      played: 0,
    },
    {
      date: '18:00 - 20:59',
      played: 0,
    },
    {
      date: '21:00 - 23:59',
      played: 0,
    },
  ] as Interval[];
  rawData.forEach((period: Period) => {
    const start = new Date(period.start_time);
    const end = new Date(period.end_time);

    data.forEach((interval: Interval) => {
      const intervalHour = parseInt(interval.date.split(':')[0]);
      const intervalStart = new Date(start);
      intervalStart.setUTCHours(intervalHour, 0, 0, 0);
      const intervalEnd = new Date(
        intervalStart.getTime() + 3 * 60 * 60 * 1000
      );

      const activeStart = start > intervalStart ? start : intervalStart;
      const activeEnd = end < intervalEnd ? end : intervalEnd;

      if (activeStart < activeEnd) {
        const activeTime =
          (activeEnd.getTime() - activeStart.getTime()) / (60 * 1000); // Convert to minutes
        interval.played += Math.round(activeTime);
      }
    });
  });

  return data;
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

  const chartItems: ChartItem[] = allTimestamps.map(timestamp => ({
    date: timestamp,
    channels: {},
  }));

  // Populate channels data
  dataset.forEach(item => {
    const fromHour = parseInt(item.from.split(':')[0]);
    const toHour = (fromHour + 2) % 24;
    const toMinute = 59;
    const timestamp = `${item.from} - ${toHour.toString().padStart(2, '0')}:${toMinute.toString().padStart(2, '0')}`;
    const chartItem = chartItems.find(ci => ci.date === timestamp);

    if (chartItem) {
      item.channels.forEach(channel => {
        if (channel.name) {
          chartItem.channels[channel.name] = channel.members?.length || 0;
        }
      });
    }
  });

  return chartItems;
}

export default async function guild_stats(
  { token, type }: { token: string; type: string },
  guildid: string
): Promise<string | null> {
  try {
    const guild = await fetchGuild(token, type, guildid);
    if (!guild) return null;
    const Req = await axios.get(`${EndpointHTTP}/v1/guild/${guild.id}/stats`, {
      headers: {
        Authorization: `Pona! ${EndpointKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Pona! Application (OpenPonlponl123.com/v1)',
      },
    });
    if (Req.status === 200 && Req.data.active) {
      const averageUsage = calculateActiveIntervals(Req.data.active);
      const membersInChannel = convertToChartFormat(
        Req.data.history as DatasetItem[]
      );
      return JSON.stringify({
        active: averageUsage,
        members: membersInChannel,
      });
    }
    return null;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('Axios error occurred:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data,
      });
    } else {
      console.error('Failed to get Guild Active Usage Stats:', err);
    }
    return null;
  }
}
