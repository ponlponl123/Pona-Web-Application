import MyButton from '@/components/button';
import MyRoundedButton from '@/components/rounded-button';
import { Leaf, Cookie } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function Home() {
  return (
    <main className="w-full min-h-screen main-bg">
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="w-full max-w-screen-lg flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className='bg-white bg-opacity-30 rounded-2xl flex flex-col gap-2 p-4 -mt-24'>
            <h1 className='flex gap-3 items-center text-2xl mb-0'>
              <Cookie
                alt="Next.js logo"
                weight='regular'
                size={32}
              />
              Cookie!
            </h1>
            <p>This application will using cookie for authorize some services</p>
          </div>
          <h1 className='text-6xl'>Pona!</h1>
          <ol className="list-inside list-decimal text-sm text-center sm:text-left">
            <li className="mb-2">
              Get started by editing{" "}
              <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
                src/app/page.tsx
              </code>
              .
            </li>
            <li>Save and see your changes instantly.</li>
          </ol>

          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <Link
              href="/invite"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MyButton style="primary">
                <Leaf
                  weight="fill"
                  alt="Leaf"
                />
                Invite Pona!
              </MyButton>
            </Link>
            <Link
              href="/app"
              rel="noopener noreferrer"
            >
              <MyRoundedButton style="invert" size="medium">
                Explore Pona Controller!
              </MyRoundedButton>
            </Link>
          </div>
        </main>
      </div>
    </main>
  );
}
