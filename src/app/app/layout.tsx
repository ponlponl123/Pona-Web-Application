import handshake from '@/server-side-api/handshake';
import { Metadata } from 'next';
import React from 'react';
import App_notOk from './app_notOk';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Pona! Application',
  description: 'Pona! is a useful discord application and free to use.',
};

async function Layout(props: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const app_isOk = await handshake();

  return (
    <main>
      {app_isOk ? (
        <Providers>{props.children}</Providers>
      ) : (
        // <App_notReady />
        <App_notOk />
      )}
      {props.modal}
      <div id='modal-root' />
    </main>
  );
}

export default Layout;
