"use client"
import { useEffect, useState } from "react";
import { Appbar } from "@/components/Appbar";
import { NextTask } from "@/components/NextTask";
import Image from "next/image";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check if localStorage is available on the client-side
    if (typeof window !== "undefined" && localStorage.getItem("token") !== null) {
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <div>
        <h1>Not logged in</h1>
      </div>
    );
  }

  return (
    <div>
      <Appbar />
      <NextTask />
    </div>
  );
}
