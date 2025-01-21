"use client";
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'
import { BellSimple, Wrench } from '@phosphor-icons/react/dist/ssr';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';

function Page() {
    const { language } = useLanguageContext();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return (
        <main id="app-panel">
            <main id="app-workspace">
                <h1 className='text-2xl mb-4'>{language.data.app.updates.name}</h1>
                <div className='flex mt-6 justify-between gap-12 flex-wrap items-center max-w-screen-lg'>
                    <h2 className='text-5xl mt-6 flex gap-4 items-center'><Wrench size={48} weight='fill' /> {language.data.app.updates.latest}: Pre-Release 0.2.0</h2>
                    <Button onPress={onOpen} color="primary" radius='full' size='lg'><BellSimple />{language.data.app.updates.subscription}</Button>
                </div>
                <Modal isOpen={isOpen} backdrop='blur' scrollBehavior='inside' onOpenChange={onOpenChange}>
                    <ModalContent>
                    {(onClose) => (
                        <>
                        <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
                        <ModalBody>
                            <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                            risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                            quam.
                            </p>
                            <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                            risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                            quam.
                            </p>
                            <p>
                            Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit dolor
                            adipisicing. Mollit dolor eiusmod sunt ex incididunt cillum quis. Velit duis sit
                            officia eiusmod Lorem aliqua enim laboris do dolor eiusmod. Et mollit incididunt
                            nisi consectetur esse laborum eiusmod pariatur proident Lorem eiusmod et. Culpa
                            deserunt nostrud ad veniam.
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                            Close
                            </Button>
                            <Button color="primary" onPress={onClose}>
                            Action
                            </Button>
                        </ModalFooter>
                        </>
                    )}
                    </ModalContent>
                </Modal>
            </main>
        </main>
    )
}

export default Page