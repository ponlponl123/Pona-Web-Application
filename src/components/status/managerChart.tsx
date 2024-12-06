"use client";
import React from 'react'
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface dataset {
    time: string;
    ping: string;
}

function ManagerChart() {
    const [data, setData] = React.useState<dataset[]>([]);

    React.useEffect(() => {
        async function fetchData() {
            const result = await fetch('/api/services/timelapse');
            if (result.ok) {
                const res = await result.json();
                setData(res.timelapse)
            }
        }
        fetchData();
    }, [setData]);
    
    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={256}>
            <AreaChart data={data} width={500} height={400} margin={{
                top: 24,
                right: 12,
                left: 12,
                bottom: 0
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
                <Area type="monotone" dataKey="ping" stroke="#f0abfc" fillOpacity={1} fill="url(#colorManager)" />
            </AreaChart>
        </ResponsiveContainer>
    )
}

export default ManagerChart