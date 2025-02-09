import axios from "axios";
import https from "https";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  
  if (!query) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  const apiEndpoint = `https://api.textyl.co/api/lyrics?q=${query}`;

  try {
    const response = await axios.get(apiEndpoint, {
      httpsAgent: agent
    });
    if (response.status !== 200) {
      throw new Error("Failed to fetch lyrics from any endpoints");
    }

    return NextResponse.json(response.data, { status: 200 });
    
  } catch {
    return NextResponse.json({ error: "Failed to fetch lyrics" }, { status: 500 });
  }
}