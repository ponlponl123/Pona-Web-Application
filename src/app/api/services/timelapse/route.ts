export type ShardData = {
  [key: string]: number
}

export type Dataset = {
  time: string
  shards: ShardData
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: false, // ปรับตามต้องการ
})

export async function GET() {
  try {
    const response = await fetch(
      "https://api.ponlponl123.com/v1/services/pona/response"
    )

    if (!response.ok) {
      return Response.json(
        { message: "API Endpoint Error", timestamp: new Date().toISOString() },
        { status: 503 }
      )
    }

    const results = await response.json()

    if (results.data && Array.isArray(results.data)) {
      const dataSet: Dataset[] = results.data.map((field: Dataset) => ({
        time: dateFormatter.format(new Date(field.time)),
        shards: field.shards,
      }))

      return Response.json(
        {
          message: "OK",
          timelapse: dataSet,
        },
        { status: 200 }
      )
    }

    return Response.json(
      { message: "No Data Found", timestamp: new Date().toISOString() },
      { status: 404 }
    )
  } catch (error) {
    return Response.json(
      { message: "Internal Server Error", timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}
