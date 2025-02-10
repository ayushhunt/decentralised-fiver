"use client"
import { Appbar } from "@/components/Appbar";
import { Hero } from "@/components/Hero";
import { Upload } from "@/components/Upload";
import { UploadImage } from "@/components/UploadImage";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if localStorage is available on the client-side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(token !== null);
    }
  }, []);

  // If the login status is still being determined, or the user is not logged in, return null
  if (isLoggedIn === null || !isLoggedIn) {
    return <div> not logged in</div>; // Optionally, you can show a loading spinner or skeleton loader here.
  }

  return (
    <div>
      <Appbar />
      <Hero />
      <Upload />
    </div>
  );
}
