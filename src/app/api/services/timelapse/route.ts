import mysql2, { RowDataPacket } from "mysql2/promise";
import query from '@/server-side-api/database/query';

interface dataset {
  time: string;
  ping: string;
}

export interface DatasetRow extends RowDataPacket, dataset {}

export async function GET() {
  const result = await query(`
    WITH numbered_rows AS (
        SELECT time, pingtomaster AS ping,
            ROW_NUMBER() OVER (ORDER BY id DESC) AS row_num
        FROM pona_heartbeat_interval
    )
    SELECT time, ping
    FROM numbered_rows
    WHERE (row_num - 1) % 15 = 0
    LIMIT 128;
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
        ping: field.ping
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