'use client';
import { useLanguageContext } from '@/contexts/languageContext';
import { langs, languageKeys } from '@/utils/i18n';
import { Avatar, Select, SelectItem, Tooltip } from '@heroui/react';
import {
  Atom,
  Bird,
  Coffee,
  Cube,
  Gavel,
  GithubLogo,
  PersonSimpleRun,
  PottedPlant,
  SmileyWink,
  Sunglasses,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChangeEvent } from 'react';
import AppVersion from '../app-version';

function Footer() {
  const pathname = usePathname() || '';
  const { language, setLanguage } = useLanguageContext();
  return (
    <footer
      className={`pona-footer z-[10] max-md:flex-col ${pathname && pathname.startsWith('/app') ? 'm-0' : '-mt-24'}`}
    >
      <div className='max-md:order-1 w-fit div md:max-w-64'>
        <span className='opacity-50 text-xs max-md:text-center -mb-4'>
          Hello Pona! v.
          <AppVersion />
        </span>
        <span className='opacity-50 text-xs max-md:text-center'>
          © 2024 - {new Date().getFullYear()} Pona! Application - Ponlponl123
          Projects And the Ponlponl123.com Design are trademarks, services
          marks, and/or registered trademarks of Ponlponl123.com
        </span>
        <span className='opacity-30 text-xs max-md:text-center flex flex-wrap gap-1 items-center'>
          PhosphorIcons <SmileyWink size={12} />, Framer Motion{' '}
          <PersonSimpleRun size={12} />, NextUI <Sunglasses size={12} />
        </span>
      </div>
      <div className='flex flex-col justify-center items-center gap-2 flex-1'>
        <div className='div'>
          <Link
            href='https://github.com/ponlponl123/Pona-Discord-Application'
            target='_blank'
            rel='noopener noreferrer'
          >
            <GithubLogo alt='Github' />
            {language.data.footer.links.github}
          </Link>
          <Link
            href='https://github.com/ponlponl123/Pona-Discord-Application/tree/main/docs'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Atom alt='Atom' />
            {language.data.footer.links.apidocs}
          </Link>
          <Link
            href='https://ponlponl123.com/discord'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Bird alt='Bird' />
            {language.data.footer.links.support}
          </Link>
          <Link href='/community' rel='noopener noreferrer'>
            <PottedPlant alt='PottedPlant' />
            {language.data.community.title}
          </Link>
          <Link href='/status' rel='noopener noreferrer'>
            <Cube alt='Cube' />
            {language.data.footer.links.status}
          </Link>
          <Link
            href='https://law.ponlponl123.com/pona'
            rel='noopener noreferrer'
          >
            <Gavel alt='Gavel' />
            {language.data.footer.links.legal}
          </Link>
          <Tooltip
            className='capitalize'
            color='primary'
            size='sm'
            content={language.data.footer.links.a_coffee}
          >
            <a title={language.data.footer.links.a_coffee} className='group'>
              <Coffee alt='Coffee' className='group-hover:hidden' />
              <Coffee
                alt='A cup of Coffee'
                weight='fill'
                className='hidden group-hover:block'
              />
            </a>
          </Tooltip>
        </div>
        <div></div>
      </div>
      <div className='max-md:-order-1 div md:max-w-64'>
        <Select
          color='default'
          className='w-32'
          radius='full'
          variant='bordered'
          classNames={{
            trigger:
              'border-2 border-default-700/10 dark:border-default-900/10 px-4',
            label: '-mt-3',
          }}
          size='sm'
          label={language.data.footer.settings.lang.label}
          selectedKeys={[language.key]}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            setLanguage(event.target.value as languageKeys);
          }}
        >
          {langs.map(lang => {
            return (
              <SelectItem
                color='default'
                key={lang.key}
                startContent={
                  <Avatar
                    alt={lang.key}
                    className='w-4 h-4'
                    src={`https://flagcdn.com/${lang.country}.svg`}
                  />
                }
              >
                {lang.label}
              </SelectItem>
            );
          })}
        </Select>
      </div>
    </footer>
  );
}

export default Footer;
