"use client";

import { useEffect } from "react";
import { HoldoumenApp } from "@/app/HoldoumenApp";

const GITHUB_PAGES_URL = "https://tyxgt.github.io/holdoumen/";
const GITHUB_PAGES_HOST = "tyxgt.github.io";

export default function Home() {
  useEffect(() => {
    if (window.location.hostname !== GITHUB_PAGES_HOST) {
      window.location.replace(GITHUB_PAGES_URL);
    }
  }, []);

  return <HoldoumenApp />;
}
