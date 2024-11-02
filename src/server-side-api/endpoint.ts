export const Endpoint = process.env.PONA_APPLICATION_ENDPOINT;
export const EndpointPort = process.env.PONA_APPLICATION_ENDPOINT_PORT;
export const EndpointKey = process.env.PONA_APPLICATION_ENDPOINT_KEY;

export const EndpointHTTP = `${Endpoint}:${EndpointPort}`