'use client';
import { CustomCheckbox } from '@/components/checkbox';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useLanguageContext } from '@/contexts/languageContext';
import {
  Button,
  CheckboxGroup,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from "@heroui/react";
import { Wrench } from '@phosphor-icons/react/dist/ssr';
import React from 'react';

interface SubscribeModalProps extends ModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}

function SubscribeModal(props: SubscribeModalProps) {
  const { language } = useLanguageContext();
  const { userInfo } = useDiscordUserInfo();
  const [groupSelected, setGroupSelected] = React.useState<string[]>([]);

  return (
    <Modal
      backdrop='blur'
      hideCloseButton={true}
      className='rounded-3xl'
      scrollBehavior='inside'
      radius='lg'
      {...props}
    >
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className='flex items-center gap-3'>
              <Wrench size={20} weight='fill' />{' '}
              {language.data.app.updates.subscription.modal.title}
            </ModalHeader>
            <ModalBody>
              <p>{language.data.app.updates.subscription.modal.body1}</p>
              <div className='flex flex-col gap-1 w-full'>
                <CheckboxGroup
                  classNames={{
                    base: 'w-full',
                  }}
                  label={language.data.app.updates.subscription.modal.checklist}
                  value={groupSelected}
                  onChange={setGroupSelected}
                >
                  {userInfo && userInfo?.email && (
                    <CustomCheckbox
                      className='rounded-2xl'
                      name='Email'
                      description={userInfo.email}
                      value={userInfo.email}
                      isDisabled
                    />
                  )}
                  {userInfo && userInfo.username && (
                    <CustomCheckbox
                      className='rounded-2xl'
                      name='Discord DMs'
                      description={`@${userInfo.username}`}
                      value={'self'}
                      isDisabled
                    />
                  )}
                </CheckboxGroup>
              </div>
              <p className='text-sm'>
                {language.data.app.updates.subscription.modal.body2
                  .split('[link]')
                  .map((part, index) =>
                    index === 1 ? (
                      <React.Fragment key={index}>
                        <Link
                          className='text-sm'
                          isBlock
                          showAnchorIcon
                          target='_blank'
                          href='https://github.com/Ponlponl123/Pona-Discord-Application'
                        >
                          Pona! Repository
                        </Link>
                        {part}
                      </React.Fragment>
                    ) : (
                      <React.Fragment key={index}>{part}</React.Fragment>
                    )
                  )}
              </p>
            </ModalBody>
            <ModalFooter className='items-center'>
              <Button
                className='rounded-2xl'
                color='danger'
                variant='light'
                onPress={onClose}
              >
                {language.data.app.updates.subscription.modal.notnow}
              </Button>
              <Button className='rounded-2xl' color='primary' onPress={onClose}>
                {groupSelected.length === 0
                  ? language.data.app.updates.subscription.modal.update
                  : language.data.app.updates.subscription.modal.letnotify}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default SubscribeModal;
