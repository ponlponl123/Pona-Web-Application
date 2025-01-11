"use client";
import React from 'react'
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { viewType } from '@/app/status/page';

type ShardData = {
    [key: string]: number;
};

type Dataset = {
    time: string;
    shards: ShardData;
};

function ManagerChart({ mode }: { mode?: viewType }) {
    const [data, setData] = React.useState<Dataset[]>([]);
    const sliceDataSet = mode === '24h' ? 1 : mode === '12h' ? 2 : mode === '9h' ? 3 : mode === '6h' ? 4 : mode === '3h' ? 8 : mode === '1h' ? 12 : mode === '45min' ? 16 : mode === '30min' ? 24 : mode === '15min' ? 48 : 1;

    React.useEffect(() => {
        async function fetchData() {
            const result = await fetch('/api/services/timelapse');
            if (result.ok) {
                const res = await result.json();
                setData(res.timelapse.slice(0, res.timelapse.length/sliceDataSet).reverse())
            }
        }
        fetchData();
    }, [setData, sliceDataSet]);

    // Extract unique shard IDs
    const shardIds = Array.from(new Set(data.flatMap(d => Object.keys(d.shards))));

    // Transform data for recharts
    const chartData = data.map(d => ({
        time: d.time,
        ...d.shards
    }));
    
    function getRandomColor(seed: string): string {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = (hash & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();
        return "#" + "00000".substring(0, 6 - color.length) + color;
    }
    
    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={256}>
            <AreaChart data={chartData} width={500} height={400} margin={{
                top: 24,
                right: 12,
                left: 12,
                bottom: 12
            }}>
                <defs>
                    <linearGradient id="colorManager" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f0abfc" stopOpacity={0.64}/>
                        <stop offset="95%" stopColor="#f0abfc" stopOpacity={0.06}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <Tooltip />
                {shardIds.map((shardId, index) => {
                    if ( index === 0 )
                        return (
                            <Area
                                key={shardId}
                                type="monotone"
                                dataKey={shardId}
                                stroke="#f0abfc"
                                fillOpacity={1}
                                fill="url(#colorManager)"
                            />
                        );
                    return (
                        <React.Fragment key={shardId}>
                            <defs>
                                <linearGradient id={`colorManager-${shardId}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={getRandomColor(shardId)} stopOpacity={0.64}/>
                                    <stop offset="95%" stopColor={getRandomColor(shardId)} stopOpacity={0.06}/>
                                </linearGradient>
                            </defs>
                            <Area
                                key={shardId}
                                type="monotone"
                                dataKey={shardId}
                                stroke={getRandomColor(shardId)}
                                fillOpacity={1}
                                fill={`url(#colorManager-${shardId})`}
                            />
                        </React.Fragment>
                    );
                })}
            </AreaChart>
        </ResponsiveContainer>
    )
}

export default ManagerChart