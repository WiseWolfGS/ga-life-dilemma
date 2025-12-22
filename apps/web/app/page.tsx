"use client";

import Image from "next/image";
import { useEffect } from "react";
import { createGrid, step, DEFAULT_PARAMS } from "@ga-life/core";

export default function Home() {
  useEffect(() => {
    console.log("--- Core Logic Tick Test ---");

    // 1. 초기 그리드 (Generation 0) 생성
    console.log("1. Creating initial grid (Gen 0)...");
    const gridGen0 = createGrid(10, 10);
    console.log("   Grid (Gen 0):", gridGen0);

    // 2. 다음 세대 (Generation 1) 계산
    console.log("2. Stepping to next generation (Gen 1)...");
    const gridGen1 = step(gridGen0, DEFAULT_PARAMS);
    console.log("   Grid (Gen 1):", gridGen1);

    console.log("--------------------------");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            GA-Life Dilemma
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            The monorepo setup is complete. The frontend app (`apps/web`) is now successfully importing code from the backend logic package (`packages/core`).
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h--12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
