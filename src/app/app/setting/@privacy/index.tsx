'use client';
import React from 'react';
import PrivacyLocation from './location';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useLanguageContext } from '@/contexts/languageContext';
import { HandWaving, ShieldCheckered } from '@phosphor-icons/react/dist/ssr';
import {
  Alert,
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  User,
} from '@nextui-org/react';
import DeleteMyData from './delete_my_data';

function Privacy() {
  const { language } = useLanguageContext();
  const { userInfo } = useDiscordUserInfo();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [deleteMyData, setDeleteMyData] = React.useState(false);

  return (
    <section
      className='w-full min-h-full my-6 flex flex-col gap-6 pb-12'
      id='privacy'
      data-section
    >
      <h1 className='text-5xl flex items-center gap-4 pt-4'>
        <ShieldCheckered weight='fill' />
        {language.data.app.setting.privacy.title}
      </h1>
      <h3 className='text-xl text-start gap-4 pt-1'>
        {language.data.app.setting.privacy.description
          .split('[read_privacypolicy]')
          .map((text, index) => {
            return index === 0 ? (
              <React.Fragment key={index}>
                {text}
                <Link
                  href='https://law.ponlponl123.com/pona#privacy'
                  target='_blank'
                  isBlock
                  showAnchorIcon
                >
                  {language.data.app.setting.privacy.read_privacypolicy}
                </Link>
              </React.Fragment>
            ) : (
              text
            );
          })}
      </h3>
      <Alert
        className='bg-secondary/20'
        title={language.data.app.setting.privacy.cookie.title}
      >
        <p>{language.data.app.setting.privacy.cookie.description}</p>
        <div className='flex flex-wrap gap-2 mt-2'>
          <Button size='sm' onPress={onOpen} startContent={<HandWaving />}>
            {language.data.app.setting.privacy.cookie.ifidenied}
          </Button>
        </div>
      </Alert>
      <Modal
        isOpen={isOpen}
        backdrop='blur'
        hideCloseButton={true}
        className='rounded-3xl'
        scrollBehavior='inside'
        onOpenChange={onOpenChange}
        radius='lg'
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex items-center gap-3'>
                <HandWaving size={20} weight='fill' />{' '}
                {language.data.app.setting.privacy.cookie.ifidenied}
              </ModalHeader>
              <ModalBody>
                <p>
                  {
                    language.data.app.setting.privacy.cookie.deletion
                      .description
                  }
                </p>
                {userInfo && (
                  <User
                    avatarProps={{
                      src: `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png?size=64`,
                      className: 'bg-primary-100',
                    }}
                    className='mb-1 mt-4'
                    description={`@${userInfo.username}`}
                    name={userInfo.global_name}
                  />
                )}
              </ModalBody>
              <ModalFooter className='items-center'>
                <Button
                  className='rounded-2xl'
                  color='default'
                  variant='light'
                  onPress={onClose}
                >
                  {language.data.app.setting.privacy.cookie.deletion.cancel}
                </Button>
                <Button
                  className='rounded-2xl'
                  color='danger'
                  variant='light'
                  onPress={() => {
                    onClose();
                    setDeleteMyData(true);
                  }}
                >
                  {language.data.app.setting.privacy.cookie.deletion.confirm}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {deleteMyData && <DeleteMyData />}
      <PrivacyLocation />
    </section>
  );
}

export default Privacy;
