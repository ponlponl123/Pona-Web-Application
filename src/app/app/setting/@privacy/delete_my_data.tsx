import { useLanguageContext } from '@/contexts/languageContext';
import { revokeUserAccessToken } from '@/server-side-api/discord/fetchUser';
import { Modal, ModalBody, ModalContent, ModalHeader, Spinner } from '@nextui-org/react'
import { deleteCookie, getCookie } from 'cookies-next';
import React from 'react'

function DeleteMyData() {
  const { language } = useLanguageContext();
  React.useEffect(()=>{
    revokeUserAccessToken(String(getCookie('LOGIN_')));
    deleteCookie('LOGIN_');
    deleteCookie('LOGIN_TYPE_');
    deleteCookie('USR');
    deleteCookie('lang');
    deleteCookie('theme');
    setTimeout(()=>{
      window.location.href = '/'
    }, 3000)
  })
  return (
    <Modal isOpen={true} backdrop='blur' hideCloseButton={true} size='full' scrollBehavior='inside' radius='none' className='z-[999]' classNames={{
      wrapper: "z-[999]"
    }}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">{language.data.app.setting.privacy.cookie.deletion.deleting.title}</ModalHeader>
        <ModalBody>
          <div className='w-full h-full flex flex-col justify-center items-center m-auto gap-3 my-24'>
            <Spinner color='current' />
            <p>{language.data.app.setting.privacy.cookie.deletion.deleting.placeholder}</p>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default DeleteMyData