import axios, { HttpStatusCode } from 'axios';

export type ShardData = {
  [key: string]: number;
};

export type dataset = {
  time: string;
  shards: ShardData;
};

export async function GET() {
  const result = await axios.get(
    'https://api.ponlponl123.com/v1/services/pona/response'
  );
  if (result) {
    const results = result.data;
    if (results.data) {
      const dataSet: dataset[] = (results.data as dataset[]).map(field => {
        return {
          time: new Date(field.time).toLocaleString([], {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }),
          shards: field.shards,
        };
      });
      return Response.json(
        {
          message: 'OK',
          timelapse: dataSet,
        },
        {
          status: HttpStatusCode.Ok,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    return Response.json(
      {
        message: 'API Endpoint Error',
        timestamp: new Date().toISOString(),
      },
      { status: HttpStatusCode.ServiceUnavailable }
    );
  } else {
    return Response.json(
      {
        message: 'Internal Server Error',
        timestamp: new Date().toISOString(),
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
