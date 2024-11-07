"use client";
import React from 'react'
import mysql2, { RowDataPacket } from "mysql2/promise";
import query from '@/server-side-api/database/query';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface dataset {
    time: string;
    ping: string;
}

export interface DatasetRow extends RowDataPacket, dataset {}

function ManagerChart() {
    const [data, setData] = React.useState<dataset[]>([]);

    React.useEffect(() => {
        async function fetchData() {
            const result = await query(`
                WITH numbered_rows AS (
                    SELECT time, pingtomaster AS ping,
                        ROW_NUMBER() OVER (ORDER BY id DESC) AS row_num
                    FROM pona_heartbeat_interval
                )
                SELECT time, ping
                FROM numbered_rows
                WHERE (row_num - 1) % 30 = 0
                LIMIT 128;
            `);
            if (result) {
                const results: [mysql2.QueryResult, DatasetRow[]] = JSON.parse(result);
                const dataSet: dataset[] = (results[0] as dataset[]).map(field => {
                    return {
                        time: new Date(field.time).toLocaleString(undefined, {day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric'}),
                        ping: field.ping
                    }
                })
                setData(dataSet.reverse());
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