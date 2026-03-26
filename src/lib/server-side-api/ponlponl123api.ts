"use server"

export default async function handshake(): Promise<boolean> {
  try {
    const response = await fetch("https://api.ponlponl123.com/")
    return response.ok
  } catch {
    return false
  }
}
