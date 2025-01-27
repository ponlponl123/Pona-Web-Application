import axios, { HttpStatusCode } from "axios";
import { NextRequest } from "next/server";
import {
  // fromLatLng,
  geocode,
  OutputFormat,
  RequestType,
  // setDefaults
} from "react-geocode";

// interface GeocodeResult {
//   formatted_address: string;
//   address_components: AddressComponent[];
// }

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

// interface GeocodeResponse {
//   results: GeocodeResult[];
// }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{lat: string, lng: string}> }
) {
  const { lat, lng } = await params;
  const searchParams = request.nextUrl.searchParams;
  let tempUnit = 'celsius';
  if ( Number.isNaN(lat) || Number.isNaN(lng) )
    return Response.json({
      message: `Latitude OR Longitude is NaN`
    }, {status: HttpStatusCode.BadRequest})
  
  if ( searchParams.has('tmp_unit') && (
    searchParams.get('tmp_unit') !== 'celsius' &&
    searchParams.get('tmp_unit') !== 'fahrenheit'
  ) )
    return Response.json({
      message: `Invalid Temperature Unit`
    }, {status: HttpStatusCode.BadRequest})
  else
    tempUnit = searchParams.get('tmp_unit') || 'celsius';

  const callOpenMeteo = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunset&temperature_unit=${tempUnit}&timeformat=unixtime&timezone=Asia%2FBangkok&past_days=1&forecast_days=1`)
  
  if ( callOpenMeteo.status !== 200 )
    return Response.json({
      message: `Service Unavailable`
    }, {status: HttpStatusCode.ServiceUnavailable})

  try {
    const geocodeResponse = await geocode(RequestType.LATLNG, `${lat},${lng}`, {
      enable_address_descriptor: true,
      key: process.env.GOOGLE_GEOCODING_API_KEY,
      outputFormat: OutputFormat.JSON
    });

    if (geocodeResponse.results.length === 0) {
      return Response.json({
        message: 'No geocoding results found'
      }, {status: HttpStatusCode.NotFound});
    }

    const address = geocodeResponse.results[0].formatted_address;
    const { city, state, country } = geocodeResponse.results[0].address_components.reduce(
      (acc: { city?: string; state?: string; country?: string }, component: AddressComponent) => {
        if (component.types.includes("locality"))
          acc.city = component.long_name;
        else if (component.types.includes("administrative_area_level_1"))
          acc.state = component.long_name;
        else if (component.types.includes("country"))
          acc.country = component.long_name;
        return acc;
      },{}
    );

    return Response.json({
      message: 'Ok',
      source: 'Open-Meteo',
      geo_source: 'Google',
      city: city,
      state: state,
      country: country,
      address: address,
      data: callOpenMeteo.data
    }, {status: HttpStatusCode.Ok});
  } catch (error) {
    // if (error instanceof Error && error.message.includes('ZERO_RESULTS')) {
    //   return Response.json({
    //     message: 'Ok',
    //     source: 'Open-Meteo',
    //     city: 'Unknown',
    //     state: 'Unknown',
    //     country: 'Unknown',
    //     address: 'Unknown',
    //     error: 'No geocoding results found',
    //     data: callOpenMeteo.data
    //   }, {status: HttpStatusCode.Ok});
    // }
    console.error(error);
    return Response.json({
      message: 'Ok',
      source: 'Open-Meteo',
      city: 'Unknown',
      state: 'Unknown',
      country: 'Unknown',
      address: 'Unknown',
      error: 'No geocoding results found',
      data: callOpenMeteo.data
    }, {status: HttpStatusCode.Ok});
    // return Response.json({
    //   message: 'Geocoding request failed',
    //   error: error instanceof Error ? error.message : 'Unknown error'
    // }, {status: HttpStatusCode.InternalServerError});
  }
}