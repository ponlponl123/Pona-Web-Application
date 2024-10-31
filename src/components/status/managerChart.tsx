"use client";
import React from 'react'
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function ManagerChart() {
    const date = new Date();
    const data = [
        {
            time: '00:00',
            manager: 0,
        },
        {
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            manager: 1,
        },
    ];
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
                        <stop offset="5%" stopColor="#f0abfc" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#f0abfc" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <Tooltip />
                <Area type="monotone" dataKey="manager" stroke="#f0abfc" fillOpacity={1} fill="url(#colorManager)" />
            </AreaChart>
        </ResponsiveContainer>
    )
}

export default ManagerChart