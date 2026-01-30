import React, { Suspense } from 'react';
import { Spinner } from "@heroui/react";
import Authorize from './authorize';

export const dynamic = 'force-dynamic';

function Page() {
  return (
    <div className='w-full h-full min-h-screen flex'>
      <div className='m-auto flex flex-col gap-2 text-center items-center'>
        <Suspense fallback={<Spinner color='current' />}>
          <Authorize />
        </Suspense>
      </div>
    </div>
  );
}

export default Page;
