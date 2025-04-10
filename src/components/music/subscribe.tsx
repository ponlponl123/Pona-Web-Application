import React from 'react'
import { Button, ButtonProps, Modal, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react'
import { usePonaMusicCacheContext } from '@/contexts/ponaMusicCacheContext';
import { getCookie } from 'cookies-next';
import subscribe, { unsubscribe } from '@/server-side-api/internal/channel';
import { useLanguageContext } from '@/contexts/languageContext';
import { IconProps, type Icon } from '@phosphor-icons/react'

export type PressEvent = Parameters<NonNullable<React.ComponentProps<typeof Button>['onPress']>>[0];

interface SubscribeButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    channelId: string;
    artistName?: string;
    preset?: 'full' | 'minimal';
    unsubscribeConfirmation?: boolean;
    DynamicIcon?: Icon;
    DynamicIconAlign?: 'left' | 'right';
    DynamicIconProps?: IconProps;
    children?: React.ReactNode;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    triggerClassName?: string;
    triggerProps?: ButtonProps;
}

function SubscribeButton({
    channelId, artistName, triggerClassName, triggerProps, children,
    DynamicIcon, DynamicIconAlign='left', DynamicIconProps, unsubscribeConfirmation=true,
    startContent, endContent, preset, ...rest
}: SubscribeButtonProps) {
    const { language } = useLanguageContext();
    const [isSubscribed, SetIsSubscribed] = React.useState(false);
    const { GetSubscribeStateFromChannelId } = usePonaMusicCacheContext();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    React.useEffect(() => {
        const fetchSubscribeState = async () => {
            const state = await GetSubscribeStateFromChannelId(channelId);
            SetIsSubscribed(state.state);
        };
        fetchSubscribeState();
    }, [GetSubscribeStateFromChannelId, channelId]);

    let overrideTriggerProps = triggerProps;

    if ( preset === 'full' )
        overrideTriggerProps = {
            radius: 'full',
            size: 'lg',
            color: 'primary',
            className: 'font-bold max-md:text-sm max-md:min-h-0 max-md:min-w-0 max-md:py-3 max-md:px-4 max-md:h-max',
            variant: isSubscribed ? 'solid' : 'bordered',
            ...triggerProps
        }
    else if ( preset === 'minimal' )
        overrideTriggerProps = {
            color: 'default',
            radius: 'full',
            ...triggerProps
        }

    return (
        <>
            <SubscribeButtonTrigger
                channelId={channelId}
                props={overrideTriggerProps}
                className={triggerClassName}
                noUnsubscribe={unsubscribeConfirmation}
                onPress={() => {
                    SetIsSubscribed((prevState) => {
                        const newState = !prevState;
                        if ( !newState && unsubscribeConfirmation )
                        {
                            onOpen();
                            return prevState;
                        }
                        return newState;
                    })
                }}
            >
                {
                    children ??
                    <div className='flex flex-row gap-2 items-center justify-center' style={{
                        color: overrideTriggerProps?.style?.color
                    }} {...rest}>
                        {DynamicIcon&&DynamicIconAlign==='left'&&<DynamicIcon weight={isSubscribed?'fill':'bold'} {...DynamicIconProps} />}
                        {startContent}
                        {isSubscribed
                            ? language.data.app.guilds.player.artist.subscribed
                            : language.data.app.guilds.player.artist.subscribe}
                        {endContent}
                        {DynamicIcon&&DynamicIconAlign==='right'&&<DynamicIcon weight={isSubscribed?'fill':'bold'} {...DynamicIconProps} />}
                    </div>
                }
            </SubscribeButtonTrigger>
            {
                unsubscribeConfirmation &&
                <UnSubscribeModal artistName={artistName} channelId={channelId} isOpen={isOpen} onOpenChange={onOpenChange} onSubmit={()=>{
                    SetIsSubscribed(false);
                }} />
            }
        </>
    );
}

export function UnSubscribeModal({artistName, channelId, isOpen, onOpenChange, onSubmit}: {artistName?: string, channelId: string, isOpen: boolean, onOpenChange: () => void, onSubmit?: (e: PressEvent) => void}) {
    const { language } = useLanguageContext();
    const { SetSubscribeStateCache } = usePonaMusicCacheContext();
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                <>
                    <ModalHeader className="flex flex-col gap-1">{language.data.app.guilds.player.artist.unsubscribe_confirmation.replace('[artist_name]', artistName||'')}</ModalHeader>
                    <ModalFooter>
                        <Button color="default" variant="light" onPress={onClose}>{ language.data.common.no }</Button>
                        <Button color="danger" variant="light" onPress={(e)=>{
                            if ( onSubmit ) onSubmit(e);
                            const accessToken = getCookie('LOGIN_');
                            const accessTokenType = getCookie('LOGIN_TYPE_');
                            if ( !accessToken || !accessTokenType ) return onClose();
                            unsubscribe(accessTokenType, accessToken, channelId);
                            SetSubscribeStateCache((value)=>{
                                return value.filter((item) => item.channelId !== channelId).concat({ channelId, state: false });
                            })
                            onClose();
                        }}>{ language.data.app.guilds.player.artist.unsubscribe }</Button>
                    </ModalFooter>
                </>
                )}
            </ModalContent>
        </Modal>
    )
}

export function SubscribeButtonTrigger(
    {
        channelId, children, className, props, onPress, noUnsubscribe
    }:{
        channelId: string, children: React.ReactNode, className?: string,
        props?: ButtonProps, onPress?: (e: PressEvent, state?: boolean) => void, noUnsubscribe?: boolean
    }
) {
    const accessToken = getCookie('LOGIN_');
    const accessTokenType = getCookie('LOGIN_TYPE_');
    const { subscribe_state_cache, SetSubscribeStateCache, GetSubscribeStateFromChannelId } = usePonaMusicCacheContext();
    return (
        <Button className={!(props?.className||props?.style)?(className??'block bg-transparent p-0 m-0 min-w-0 min-h-0 max-h-none max-w-none rounded-none border-0'):undefined} {...props} onPress={async (e)=>{
            if ( !accessToken || !accessTokenType )
            {
                if ( onPress ) onPress(e);
                return;
            }
            const currentState = await GetSubscribeStateFromChannelId(channelId);
            if ( onPress ) onPress(e, currentState?.state);
            if (currentState) {
                if ( currentState.state )
                {
                    if ( noUnsubscribe ) return;
                    unsubscribe(accessTokenType, accessToken, channelId);
                    SetSubscribeStateCache((value)=>{
                        return value.filter((item) => item.channelId !== channelId).concat({ channelId, state: false });
                    })
                }
                else
                {
                    subscribe(accessTokenType, accessToken, channelId);
                    SetSubscribeStateCache((value)=>{
                        return value.filter((item) => item.channelId !== channelId).concat({ channelId, state: true });
                    })
                }
            } else {
                subscribe(accessTokenType, accessToken, channelId);
                SetSubscribeStateCache([...subscribe_state_cache, { channelId, state: true }]);
            }
        }}>
            {children}
        </Button>
    )
}

export default SubscribeButton