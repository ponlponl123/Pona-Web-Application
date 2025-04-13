"use client"
import React from 'react'

function AppVersion() {
  return (<>{process.env["NEXT_PUBLIC_APP_VERSION"] || 'unknown'}</>)
}

export default AppVersion
