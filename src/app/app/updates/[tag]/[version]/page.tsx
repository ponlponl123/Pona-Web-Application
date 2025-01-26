"use client";

import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'
import { Translations } from '../../page'
import { Button, Chip, Spinner, useDisclosure } from '@nextui-org/react'
import Markdown from 'marked-react';
import { useParams, useRouter } from 'next/navigation';
import { BellSimple, CaretLeft } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import SubscribeModal from '../../subscribe_modal';

function PatchNote({ tag, version, note }: { tag: string, version: string, note: string }) {
  const router = useRouter();
  const { language } = useLanguageContext();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <SubscribeModal isOpen={isOpen} onOpenChange={onOpenChange}><></></SubscribeModal>
      <div className='flex items-center gap-2 mb-4 mt-8'>
        <Link href='/app/updates' onClick={()=>{router.push('/app/updates')}}>
          <Button variant='flat' color='primary' size='lg' radius='full' startContent={<CaretLeft />}>{language.data.app.updates.name}</Button>
        </Link>
        <div className='flex items-center gap-2'>
          <Chip color={
              tag.toLowerCase() === 'pre-release' ? 'warning' :
              tag.toLowerCase() === 'release' ? 'primary' :
              'default'
          }>{
              (language.data.app.updates.translate as Translations)[tag.toLowerCase()] ?
              (language.data.app.updates.translate as Translations)[tag.toLowerCase()] :
              tag
          }</Chip>{language.data.app.updates.version} {version.replace('.md','')}
        </div>
        <Button onPress={onOpen} isIconOnly color='primary' size='lg' radius='full' className='ml-auto'><BellSimple weight='fill' /></Button>
      </div>
      <div className='block relative my-6 w-full max-w-full h-max prose markdown text-foreground'>
        <Markdown>{note}</Markdown>
      </div>
    </>
  )
}

function Loading() {
  return (
    <div className='flex items-center justify-center w-full h-[96vh]'>
      <Spinner color='primary' />
    </div>
  )
}

async function fetchNoteData(tag: string, version: string) {
  const res = await fetch(`/api/patchnote/${tag}/${version}.md`);
  const selectedNote = await res.text();
  return selectedNote;
}

function Page() {
  const params = useParams<{ tag: string; version: string }>()

  const [note, setNote] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (params) {
      const { tag, version } = params;
      fetchNoteData(tag, version).then(setNote);
    }
  }, [params]);

  if (!params) {
    return <Loading />;
  }

  const { tag, version } = params;

  if (!note) {
    return <Loading />;
  }

  return (
    <main id="app-panel">
      <main id="app-workspace">
        <PatchNote tag={tag} version={version} note={note} />
      </main>
    </main>
  );
}

export default Page