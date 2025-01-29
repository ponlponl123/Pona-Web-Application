"use client";
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'
import { BellSimple, CaretRight, Link as IconLink, SmileyXEyes, Wrench } from '@phosphor-icons/react/dist/ssr';
import { Avatar, Button, Chip, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, Snippet, Spinner, useDisclosure } from '@nextui-org/react';
import Markdown from 'marked-react';
import SubscribeModal from './subscribe_modal';

export interface notes {
    tag: string;
    versions: string[];
}

export interface Translations {
    [key: string]: string;
}

function Page() {
    const { language } = useLanguageContext();
    const [selectedNote, setSelectedNote] = React.useState<{note: notes, version: string} | null>(null);

    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const [data, setData] = React.useState<notes[]>([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    React.useEffect(() => {
        setTimeout(async () => {
            try {
                const response = await fetch('/api/patchnote/s');
                if (!response.ok) {
                    throw new Error('HTTP error!');
                }
                const data = await response.json();
                setData(data.available_notes);
                setIsLoading(false);
            } catch {
                setError(true);
                setIsLoading(false);
            }
        }, 2000);
    }, []);

    return (
        <main id="app-panel">
            <main id="app-workspace">
                <h1 className='text-2xl mb-4'>{language.data.app.updates.name}</h1>
                <div className='flex mt-12 justify-between gap-12 lg:flex-wrap items-center'>
                    <h2 className='text-5xl flex gap-4 items-center'><Wrench size={48} weight='fill' /> {language.data.app.updates.latest}: Pre-Release 0.2.1</h2>
                    <Button onPress={onOpen} color="primary" radius='full' size='lg' className='max-lg:p-4 max-lg:min-w-max'><BellSimple weight='fill' /><span className='text-primary-foreground max-lg:hidden'>{language.data.app.updates.subscription.title}</span></Button>
                </div>
                <SubscribeModal isOpen={isOpen} onOpenChange={onOpenChange}><></></SubscribeModal>
                {
                    isLoading ? (
                        <div className='w-full h-full flex flex-col justify-center items-center m-auto gap-3 my-24'>
                            <Spinner color='current' />
                        </div>
                    ) : error ? (
                        <div className='w-full h-full flex flex-col justify-center items-center m-auto gap-3 my-24'>
                            <SmileyXEyes size={48} />
                            <h1 className='text-3xl'>{language.data.app.updates.error.title}</h1>
                            <span>{language.data.app.updates.error.description}</span>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-6 w-full mt-6'>
                            {
                                data.map((note: notes, index: number) => (
                                    <React.Fragment key={`react-note-tag-group`+index}>
                                        <Chip key={`note-tag-chip`+index} size='lg' className='text-base' color={
                                            note.tag.toLowerCase() === 'pre-release' ? 'warning' :
                                            note.tag.toLowerCase() === 'release' ? 'primary' :
                                            'default'
                                        }>
                                            {
                                                (language.data.app.updates.translate as Translations)[note.tag.toLowerCase()] ?
                                                (language.data.app.updates.translate as Translations)[note.tag.toLowerCase()] :
                                                note.tag
                                            }
                                        </Chip>
                                        <div key={`note-tag-group`+index} className='flex flex-col gap-2 w-full -mt-3'>
                                        {
                                            note.versions.map((version: string, nindex: number) => {
                                                return <Button key={`note`+nindex} className='w-full py-12 group bg-foreground/10' style={{borderRadius: '32px'}} onClick={() => setSelectedNote({note, version})}>
                                                    <div className='w-full p-2 flex items-center justify-center gap-3 max-h-none'>
                                                        <div className='flex flex-col gap-1'>
                                                            <h1 className='text-2xl leading-8'>{language.data.app.updates.version} {version.replace('.md','')}</h1>
                                                        </div>
                                                        <div className='m-auto mr-4'>
                                                            <CaretRight className='group-hover:translate-x-1 group-active:-translate-x-1' size={18} />
                                                        </div>
                                                    </div>
                                                </Button>
                                            })
                                        }
                                        </div>
                                    </React.Fragment>
                                ))
                            }
                        </div>
                    )
                }
                {selectedNote?.version && (
                    <ModalContext selectedNote={selectedNote} setSelectedNote={setSelectedNote} />
                )}
            </main>
        </main>
    )
}

function ModalContext ({
    selectedNote,
    setSelectedNote
}: {
    selectedNote: { note: notes, version: string };
    setSelectedNote: React.Dispatch<React.SetStateAction<{ note: notes, version: string } | null>>;
}) {
    const { language } = useLanguageContext();
    const {onOpenChange} = useDisclosure();
    const [isLoading, setIsLoading] = React.useState(true);
    const [README, setREADME] = React.useState<string>('');

    const handleNoteClose = () => {
        setSelectedNote(null);
    }

    React.useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`/api/patchnote/${selectedNote.note.tag}/${selectedNote.version}`);
                if (!response.ok) {
                    throw new Error('HTTP error!');
                }
                const data = await response.text();
                setIsLoading(false);
                setREADME(data);
            } catch {
                setIsLoading(false);
                setREADME('');
            }
        })();
    }, [selectedNote])

    const authorMatch = README.match(/\[author-(.*?)\]/);

    return (
        <Modal isOpen={true} backdrop='opaque' size='4xl' hideCloseButton={true} className='rounded-3xl' scrollBehavior='inside' onClose={handleNoteClose} onOpenChange={onOpenChange} radius='lg'>
            <ModalContent>
            {(onNoteClose) => (
            <>
            <ModalHeader className="flex items-center gap-3">
                <Chip color={
                    selectedNote.note.tag.toLowerCase() === 'pre-release' ? 'warning' :
                    selectedNote.note.tag.toLowerCase() === 'release' ? 'primary' :
                    'default'
                }>
                    {
                        (language.data.app.updates.translate as Translations)[selectedNote.note.tag.toLowerCase()] ?
                        (language.data.app.updates.translate as Translations)[selectedNote.note.tag.toLowerCase()] :
                        selectedNote.note.tag
                    }
                </Chip>
                {language.data.app.updates.version} {selectedNote.version.replace('.md','')}
                {
                    authorMatch &&
                    <Link className='flex items-center ml-auto rounded-full p-1 relative' href={`https://github.com/${authorMatch[1]}`} target='_blank'>
                        <Avatar className='h-8 w-8' size='sm' src={`https://github.com/${authorMatch[1]}.png`} alt={`Author: ${authorMatch[1]}`} />
                        <div className='flex flex-col gap-0 mx-2'>
                            <h1 className='m-0 text-sm leading-none'>{authorMatch[1]}</h1>
                            <span className='text-[10px] leading-none font-bold text-foreground/40'>Author</span>
                        </div>
                    </Link>
                }
            </ModalHeader>
            <ModalBody className='pr-0'>
                {
                    isLoading ? (
                        <div className='w-full h-full flex flex-col justify-center items-center m-auto gap-3 my-24'>
                            <Spinner color='current' />
                        </div>
                    ) : README === '' ? (
                        <div className='w-full h-full flex flex-col gap-3'>
                            <h1 className='text-2xl'>{language.data.app.updates.error.title}</h1>
                            <p>{language.data.app.updates.error.description}</p>
                        </div>
                    ) : (
                        <ScrollShadow className='w-full h-full'>
                            <div className='block relative w-full max-w-full h-max prose markdown'>
                                <Markdown>{
                                    (() => {
                                        const lines = README.split('\n');
                                        const authorIndex = lines.findIndex(line => line.startsWith('[author-'));
                                        if (authorIndex >= 0) {
                                            lines.splice(authorIndex, 1);
                                        }
                                        return lines.join('\n');
                                    })()
                                }</Markdown>
                            </div>
                        </ScrollShadow>
                    )
                }
            </ModalBody>
            <ModalFooter className='items-center'>
                <Snippet className='rounded-2xl w-max max-w-[66%] overflow-hidden' classNames={{
                    pre: 'flex items-center gap-1 w-max max-w-full overflow-hidden whitespace-nowrap overflow-ellipsis',
                    symbol: 'p-1',
                    base: 'justify-end relative bg-default-100',
                    copyButton: 'scale-80'
                }}
                codeString={`${window.location.origin}/app/updates/${selectedNote.note.tag}/${selectedNote.version.replace('.md','')}`}
                color="default" size='sm' symbol={<IconLink weight='bold' size={14} />}>{`/app/updates/${selectedNote.note.tag}/${selectedNote.version.replace('.md','')}`}</Snippet>
                <Button className='rounded-2xl' color="default" variant='light' onPress={onNoteClose}>{language.data.app.updates.subscription.modal.close}</Button>
            </ModalFooter>
            </>
            )}
            </ModalContent>
        </Modal>
    )
}

export default Page