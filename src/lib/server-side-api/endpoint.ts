export const Endpoint = Bun.env.PONA_APPLICATION_ENDPOINT_HOST
export const EndpointPort = Bun.env.PONA_APPLICATION_ENDPOINT_PORT
export const EndpointKey = Bun.env.PONA_APPLICATION_ENDPOINT_KEY

export const EndpointHTTP = `http://${Endpoint}:${EndpointPort}`
