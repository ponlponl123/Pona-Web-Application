'use client';
import PonaIcon from '@/../public/static/flower.png';
import MyButton from '@/components/button';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useGlobalContext } from '@/contexts/globalContext';
import { useLanguageContext } from '@/contexts/languageContext';
import { fetchSearchHistory } from '@/server-side-api/internal/history';
import { fetchSearchSuggestionResult } from '@/server-side-api/internal/search';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Form,
  Input,
  ScrollShadow,
} from '@heroui/react';
import {
  CaretDownIcon,
  ClockCounterClockwise,
  Confetti,
  DiscordLogo,
  Gear,
  Leaf,
  MagnifyingGlass,
  Question,
} from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import Scrollbar from '../scrollbar';

function UserAccountAction({
  className,
  minimize = false,
}: {
  className?: string;
  minimize?: boolean;
}) {
  const { userInfo, revokeUserAccessToken } = useDiscordUserInfo();
  const { language } = useLanguageContext();
  return (
    userInfo && (
      <Dropdown placement='bottom-start'>
        <DropdownTrigger>
          <button
            type='button'
            className={`${className} outline-none ${!minimize ? 'backdrop-blur-md rounded-2xl px-3 py-2 flex gap-3 items-center justify-center w-fit' : ''}`}
          >
            <Avatar
              className='h-8 w-8'
              src={`https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`}
            />
            {!minimize && (
              <div className='flex flex-col items-start'>
                <h1 className='text-base font-bold tracking-wider leading-none'>
                  {userInfo.global_name}
                </h1>
                <span className='text-xs'>@{userInfo.username}</span>
              </div>
            )}
          </button>
        </DropdownTrigger>
        <DropdownMenu aria-label='User Actions' variant='flat'>
          <DropdownItem key='profile' className='h-14 gap-2'>
            <p className='font-bold'>{language.data.header.account.signinas}</p>
            <p className='font-bold'>@{userInfo.username}</p>
          </DropdownItem>
          <DropdownItem key='app' startContent={'🏓'} href='/app'>
            {language.data.header.account.playground}
          </DropdownItem>
          <DropdownItem
            key='configurations'
            startContent={<Gear weight='fill' />}
            href='/app/setting'
          >
            {language.data.header.account.setting}
          </DropdownItem>
          <DropdownItem
            key='help_and_feedback'
            startContent={<Question weight='fill' />}
            href='https://ponlponl123.com/discord'
            target='_blank'
          >
            {language.data.header.account.support}
          </DropdownItem>
          <DropdownItem
            key='logout'
            startContent={<Leaf weight='fill' />}
            color='danger'
            onClick={() => {
              revokeUserAccessToken(getCookie('LOGIN_') as string);
            }}
          >
            {language.data.header.account.logout}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
  );
}

function Header() {
  const pathname = usePathname() || '';
  const [navOpened, setNavOpened] = React.useState<boolean>(false);
  const router = useRouter();
  const { guild } = useDiscordGuildInfo();
  const { language } = useLanguageContext();
  const { userInfo } = useDiscordUserInfo();
  const { ponaCommonState, isSameVC, isMemberInVC } = useGlobalContext();

  const isApp = pathname.startsWith('/app');
  const isInGuild =
    isApp &&
    pathname.split('/').includes('g') &&
    typeof Number(pathname.split('/')[3]) === 'number';
  const guildPath = isInGuild ? pathname.split('/')[4] : '';
  const isMusicApp = isApp && pathname.includes('/player');
  const isIndex = pathname === '/';

  const searchSuggestionElement = React.useRef<HTMLDivElement>(null);
  const searchInputElement = React.useRef<HTMLInputElement>(null);
  const [searching, setSearching] = React.useState<boolean>(false);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [searchSuggestions, setSearchSuggestions] = React.useState<string[]>(
    []
  );
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  const [fetchedSearchHistory, setFetchedSearchHistory] =
    React.useState<boolean>(false);
  const [typingTimeout, setTypingTimeout] =
    React.useState<NodeJS.Timeout | null>(null);

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (
      searchSuggestionElement.current &&
      !searchSuggestionElement.current.contains(event.relatedTarget as Node)
    )
      setSearching(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      searchSuggestionElement.current &&
      !searchSuggestionElement.current.contains(event.target as Node) &&
      searchInputElement.current &&
      !searchInputElement.current.contains(event.target as Node)
    ) {
      setSearching(false);
    }
  };

  const addToSearchHistory = (value: string) => {
    setSearchHistory(prev_value => {
      if (prev_value.includes(value))
        prev_value.splice(prev_value.indexOf(value), 1);
      prev_value = [value, ...prev_value.slice(0, 6)];
      return prev_value;
    });
  };

  React.useEffect(() => {
    if (searching) {
      window.addEventListener('click', handleClickOutside);
    } else {
      window.removeEventListener('click', handleClickOutside);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [searching]);

  return (
    <header
      className={`nav-opened-${navOpened} ${!isIndex && !isMusicApp ? 'max-md:backdrop-blur-md' : !isIndex && isMusicApp ? 'max-md:[body.pona-app-music-scrolled_&]:border-foreground/10 max-md:[body.pona-app-music-scrolled_&]:backdrop-blur-md max-md:[body.pona-app-music-scrolled_&]:bg-playground-background/40 bg-transparent border-b-2 border-foreground/0 !duration-1000 apply-soft-transition' : ''} ${!isIndex && isMemberInVC && isSameVC ? 'max-md:[body.pona-player-focused_&]:opacity-0 max-md:[body.pona-player-focused_&]:pointer-events-none' : ''} pona-header absolute w-full h-20 p-6 px-8 flex items-center justify-center gap-3`}
    >
      <div
        className={`w-full ${!isApp && 'max-w-5xl'} h-full flex items-center justify-between gap-6`}
      >
        <div className='flex gap-2 z-20 active:scale-95'>
          <Link
            href={isApp ? '/app' : '/'}
            onClick={() => {
              setNavOpened(false);
            }}
          >
            <h1 className='text-xl max-md:text-base flex gap-2 items-center'>
              {isApp ? (
                <>
                  <Image
                    src={PonaIcon}
                    alt='Pona! Application'
                    className='max-md:h-6 max-md:w-6 disable-default-transition apply-long-soft-transition'
                    width={32}
                    height={32}
                  />
                  <AnimatePresence>
                    {pathname.includes('player') ? (
                      <>
                        <motion.span
                          layoutId='app-title'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.16 }}
                          className='max-md:hidden md:contents'
                        >
                          Pona! {language.data.app.title}
                        </motion.span>
                        <motion.span
                          layoutId='app-title'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.16 }}
                          className='max-md:contents hidden'
                        >
                          {language.data.app.guilds.player.name}
                        </motion.span>
                      </>
                    ) : (
                      <>
                        <motion.span
                          layoutId='app-title'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.16 }}
                          className='max-sm:hidden sm:contents'
                        >
                          Pona! {language.data.app.title}
                        </motion.span>
                      </>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                'Pona!'
              )}
            </h1>
          </Link>
        </div>
        <div className='z-20 flex items-center gap-4'>
          {pathname.includes('player') &&
            ponaCommonState &&
            ponaCommonState.pona.voiceChannel &&
            isSameVC && (
              <div className={`${navOpened ? 'hidden' : 'contents'}`}>
                <Button
                  className={`${navOpened || (pathname.includes('player') && pathname.includes('search')) ? 'hidden' : ''} miniscreen:translate-y-8 miniscreen:pointer-events-none miniscreen:opacity-0 absolute left-1/2 -translate-x-1/2 bg-black text-white z-20`}
                  radius='full'
                  size='sm'
                  onPress={() => {
                    router.push(`/app/g/${guild?.id}/player/search`);
                  }}
                >
                  <MagnifyingGlass size={14} />
                </Button>
                <Form
                  className='max-md:contents md:absolute md:left-72 md:[body.sidebar-collapsed_&]:left-16 top-5 md:w-[calc(100%_-_18rem)] md:[body.sidebar-collapsed_&]:w-[calc(100%_-_4rem)] flex justify-center items-center gap-3 md:px-4'
                  onSubmit={e => {
                    e.preventDefault();
                    const data = Object.fromEntries(
                      new FormData(e.currentTarget)
                    );
                    router.push(
                      `/app/g/${guild?.id}/player/search?q=${encodeURIComponent(data.search.toString())}`
                    );
                    addToSearchHistory(data.search.toString());
                  }}
                >
                  <div className='max-md:contents flex w-full max-w-6xl justify-start items-center gap-4'>
                    <div className='md:relative miniscreen:w-80 max-miniscreen:top-24 max-miniscreen:left-4 max-miniscreen:translate-x-0 max-miniscreen:max-w-full max-miniscreen:w-[calc(100%_-_2rem)] max-md:max-w-[32vw] max-md:fixed max-md:-translate-x-1/2 max-md:left-1/2 [body.pona-player-focused_&]:opacity-0 [body.pona-player-focused_&]:pointer-events-none [body.pona-player-focused_&]:-translate-y-6'>
                      <Input
                        ref={searchInputElement}
                        startContent={
                          <MagnifyingGlass
                            size={18}
                            weight='bold'
                            className='mr-1 max-miniscreen:absolute max-miniscreen:scale-75'
                          />
                        }
                        name='search'
                        placeholder={
                          language.data.app.guilds.player.search.search_box
                        }
                        value={searchValue}
                        maxLength={512}
                        onValueChange={value => {
                          setSearching(true);
                          setSearchValue(value);
                          if (typingTimeout) clearTimeout(typingTimeout);
                          setTypingTimeout(
                            setTimeout(async () => {
                              if (!value) return setSearchSuggestions([]);
                              const accessTokenType = String(
                                getCookie('LOGIN_TYPE_')
                              );
                              const accessToken = String(getCookie('LOGIN_'));
                              if (
                                !accessTokenType ||
                                accessTokenType === 'undefined' ||
                                !accessToken ||
                                accessToken === 'undefined'
                              )
                                return false;

                              const searcher =
                                await fetchSearchSuggestionResult(
                                  accessTokenType,
                                  accessToken,
                                  value
                                );
                              if (searcher)
                                setSearchSuggestions(
                                  searcher.searchSuggestions
                                );
                              else setSearchSuggestions([]);
                            }, 500)
                          );
                        }}
                        onFocus={async () => {
                          setSearching(true);
                          if (!fetchedSearchHistory) {
                            const accessTokenType = String(
                              getCookie('LOGIN_TYPE_')
                            );
                            const accessToken = String(getCookie('LOGIN_'));
                            if (
                              !accessTokenType ||
                              accessTokenType === 'undefined' ||
                              !accessToken ||
                              accessToken === 'undefined'
                            )
                              return false;
                            const searchHistory = await fetchSearchHistory(
                              accessTokenType,
                              accessToken
                            );
                            if (searchHistory) {
                              setSearchHistory(searchHistory);
                              setFetchedSearchHistory(true);
                            }
                          }
                        }}
                        onBlur={handleBlur}
                        classNames={{
                          inputWrapper:
                            'rounded-full bg-foreground/10 border-2 border-foreground/10 max-miniscreen:bg-playground-background',
                          input:
                            'max-miniscreen:placeholder:opacity-0 placeholder:text-content1-foreground/40 text-foreground',
                        }}
                        className={`${
                          pathname.includes('player') &&
                          pathname.includes('search')
                            ? 'max-miniscreen:translate-x-0'
                            : 'max-miniscreen:min-w-0 max-miniscreen:w-10 max-miniscreen:pointer-events-none max-miniscreen:opacity-0 max-miniscreen:-translate-y-8'
                        } backdrop-blur rounded-xl max-md:rounded-full pona-music-searchbox z-10 text-foreground`}
                      />
                      <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        exit={{ y: -10 }}
                        transition={{ duration: 0.16 }}
                        layoutId='search-suggestions'
                        key={String(searching)}
                        className={`absolute w-full min-h-6 h-max max-h-[calc(96vh_-_64px)] top-0 lef-0`}
                      >
                        <ScrollShadow
                          id='pona-search-suggestions'
                          ref={searchSuggestionElement}
                          className={`absolute w-full min-h-6 h-max max-h-[calc(96vh_-_64px)] bg-background/25 max-miniscreen:bg-playground-background border-2 border-foreground/10 miniscreen:backdrop-blur-3xl rounded-2xl top-12 p-1 z-30 ${searching && (searchHistory.length > 0 || searchSuggestions.length > 0) ? '' : 'opacity-0 pointer-events-none -translate-y-6'}`}
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'hsl(var(--pona-app)) transparent',
                          }}
                        >
                          <div className='flex flex-col gap-1 w-full h-max'>
                            {searchValue && (
                              <Button
                                onPress={() => {
                                  router.push(
                                    `/app/g/${guild?.id}/player/search?q=${searchValue}`
                                  );
                                  setSearching(false);
                                  setSearchValue(searchValue);
                                  addToSearchHistory(searchValue);
                                }}
                                value={searchValue}
                                variant='light'
                                radius='md'
                                className='text-start justify-start gap-3 flex flex-row items-center'
                                fullWidth
                              >
                                <MagnifyingGlass
                                  size={14}
                                  weight='bold'
                                  className='text-foreground'
                                />{' '}
                                <span className='flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap'>
                                  {searchValue}
                                </span>
                              </Button>
                            )}
                            {searchSuggestions.length > 0 &&
                              searchSuggestions?.map((value, index) => (
                                <Button
                                  key={index}
                                  onPress={() => {
                                    router.push(
                                      `/app/g/${guild?.id}/player/search?q=${value}`
                                    );
                                    setSearching(false);
                                    setSearchValue(value);
                                    addToSearchHistory(value);
                                  }}
                                  onFocus={() => {
                                    setSearchValue(value);
                                  }}
                                  value={value}
                                  variant='light'
                                  radius='md'
                                  className='text-start justify-start gap-3 flex flex-row items-center'
                                  fullWidth
                                >
                                  <MagnifyingGlass
                                    size={14}
                                    weight='bold'
                                    className='text-foreground'
                                  />{' '}
                                  <span className='flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap'>
                                    {value}
                                  </span>
                                </Button>
                              ))}
                            {searchHistory.length > 0 &&
                              !searchSuggestions.length &&
                              searchHistory?.map((value, index) => (
                                <Button
                                  key={index}
                                  onPress={() => {
                                    router.push(
                                      `/app/g/${guild?.id}/player/search?q=${value}`
                                    );
                                    setSearching(false);
                                    setSearchValue(value);
                                    addToSearchHistory(value);
                                  }}
                                  onFocus={() => {
                                    setSearchValue(value);
                                  }}
                                  value={value}
                                  variant='light'
                                  radius='md'
                                  className='text-start justify-start gap-3 flex flex-row items-center'
                                  fullWidth
                                >
                                  <ClockCounterClockwise
                                    size={14}
                                    weight='bold'
                                    className='text-foreground'
                                  />{' '}
                                  <span className='flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap'>
                                    {value}
                                  </span>
                                </Button>
                              ))}
                          </div>
                        </ScrollShadow>
                      </motion.div>
                    </div>
                  </div>
                </Form>
              </div>
            )}
          <UserAccountAction minimize={true} className='md:hidden' />
          <MyButton
            className={`md:hidden! btn-icon m-0 !mr-0 ${isMusicApp ? 'max-miniscreen:hidden' : ''}`}
            style='rounded'
            variant='text'
            onClick={() => {
              setNavOpened(value => !value);
            }}
          >
            <CaretDownIcon
              size={16}
              weight='bold'
              className={navOpened ? '-rotate-180' : 'rotate-0'}
            />
          </MyButton>
        </div>
        <nav className={`nav-opened-${navOpened}`}>
          <div className='md:hidden w-full h-24 border-b mb-6 header border-foreground/10'></div>
          <div className='flex gap-3'>
            {isApp && userInfo && (
              <Scrollbar
                userInfo={userInfo}
                nav={true}
                onPushLocation={() => {
                  setNavOpened(false);
                }}
              />
            )}
          </div>
          <div className='flex gap-3 items-center'>
            {!userInfo && (
              <Link href='/app' rel='noopener noreferrer'>
                <MyButton
                  size='small'
                  variant='text'
                  style='rounded'
                  onClick={() => {
                    setNavOpened(false);
                  }}
                >
                  <DiscordLogo weight='fill' />
                  {language.data.header.actions.login}
                </MyButton>
              </Link>
            )}
            {userInfo && isInGuild && guildPath === 'player' ? (
              <>
                <UserAccountAction minimize={true} />
              </>
            ) : (
              <>
                <Link href='/invite' rel='noopener noreferrer'>
                  <MyButton
                    size='small'
                    variant='primary'
                    effect='confetti'
                    onClick={() => {
                      setNavOpened(false);
                    }}
                  >
                    <Confetti weight='fill' />
                    {language.data.header.actions.invite}
                  </MyButton>
                </Link>
                {userInfo && <UserAccountAction className='max-md:hidden' />}
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
