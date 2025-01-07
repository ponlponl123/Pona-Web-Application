import mysql2, { RowDataPacket } from "mysql2/promise";
import query from '@/server-side-api/database/query';

interface dataset {
  time: string;
  shards: {
    id: number;
    ping: string;
  }[]
}

export interface DatasetRow extends RowDataPacket, dataset {}

export async function GET() {
  const result = await query(`
    WITH numbered_rows AS (
      SELECT time, pingtomaster AS ping, shardid,
        UNIX_TIMESTAMP(time) DIV 300 AS time_slot,
        ROW_NUMBER() OVER (PARTITION BY UNIX_TIMESTAMP(time) DIV 300, shardid ORDER BY time DESC) AS rn
      FROM pona_heartbeat_interval
      WHERE time >= NOW() - INTERVAL 24 HOUR
    )
    SELECT FROM_UNIXTIME(time_slot * 300) AS time,
      CONCAT('{', GROUP_CONCAT(CONCAT('"', shardid, '": ', ping)), '}') AS shards
    FROM numbered_rows
    WHERE rn = 1
    GROUP BY time_slot
    ORDER BY time_slot DESC;
  `);
  if (result) {
    const results: [mysql2.QueryResult, DatasetRow[]] = JSON.parse(result);
    const dataSet: dataset[] = (results[0] as dataset[]).map(field => {
      return {
        time: new Date(field.time).toLocaleString([], {
          day: 'numeric', 
          month: 'short', 
          year: 'numeric', 
          hour: 'numeric', 
          minute: 'numeric'
        }),
        shards: JSON.parse(String(field.shards))
      }
    })
    return Response.json({
      message: 'OK',
      timelapse: dataSet,
    }, {status: 200});
  } else {
    return Response.json({
      message: 'Internal Server Error',
      timestamp: new Date().toISOString(),
    }, {status: 500});
  }
}