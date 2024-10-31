"use client";
import React from 'react'
import MyButton from '@/components/button'
import { Spinner } from "@nextui-org/spinner";
import { Cube } from '@phosphor-icons/react/dist/ssr'
import ManagerChart from '@/components/status/managerChart';

import handshake from '@/server-side-api/handshake';
import socketio from '@/server-side-api/socketio';
import clusterInfo, { ClusterInfo } from '@/server-side-api/clusterInfo';

function Status() {
    const [ fetching, setFetching ] = React.useState<boolean>(false);
    const [ lastRefresh, setLastRefresh ] = React.useState<Date | null>(null);
    const [ overallStatus, setOverallStatus ] = React.useState<'operational' | 'degraded' | 'down' | 'unknown'>('unknown');

    const [ handshakeStatus, setHandshakeStatus ] = React.useState<boolean | null>(null);
    const [ websocketStatus, setWebsocketStatus ] = React.useState<boolean | null>(null);
    const [ clusterInfoStatus, setClusterInfoStatus ] = React.useState<false | ClusterInfo | null>(null);

    function setOverallServiceStatus(
        handshake: boolean,
        websocket: boolean,
        cluster: false | ClusterInfo
    ) {
        setHandshakeStatus(handshake);
        setWebsocketStatus(websocket);
        setClusterInfoStatus(cluster);
        if (
            !handshake &&
            !websocket &&
            !cluster
        ) return setOverallStatus('down');
        if (
            !handshake ||
            !websocket ||
            !cluster
        ) return setOverallStatus('degraded');
        return setOverallStatus('operational');
    }

    const refresh = async (): Promise<void> => {
        if ( fetching ) return;
        setFetching(true);

        const handshakeReq = await handshake();
        const socketioReq = await socketio();
        const clusterInfoReq = await clusterInfo();

        setOverallServiceStatus(
            handshakeReq,
            socketioReq,
            clusterInfoReq
        );
        
        setLastRefresh(new Date());
        setFetching(false);
    }

    React.useEffect(() => {
        refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="w-full min-h-screen">
            <div className="flex flex-col grid-rows-[20px_1fr_20px] items-center min-h-screen p-8 pb-20 gap-8 sm:p-20">
                <div className='mt-16'></div>
                <main className="w-full max-w-screen-lg flex flex-col justify-start gap-10">
                    <div className='flex flex-row items-center justify-between'>
                        <div className='flex flex-col gap-4'>
                            <h1 className='text-5xl flex items-center gap-4'>
                                <Cube size={48} />
                                Status
                                <div className={`service-status-badge ${overallStatus}`}></div>
                            </h1>
                            <p className='text-lg'>Last Refreshed: {!fetching && lastRefresh ? lastRefresh.toLocaleString() : 'Refreshing...'}</p>
                        </div>
                        <div className='flex flex-row gap-4 items-center'>
                            <a onClick={refresh}>
                                <MyButton>{ fetching ? <Spinner size='sm' color="default" /> : "Refresh" }</MyButton>
                            </a>
                        </div>
                    </div>
                    <div className='status-block'>
                        <h1 className='text-3xl'>Overall Status</h1>
                        <div className='flex flex-col gap-4 mt-4'>
                            <div className='service-list'><h1>Internal APIs</h1>
                            <div className={`service-status-badge ${handshakeStatus ? 'operational' : handshakeStatus === null ? 'unknown' : 'down'}`}></div></div>
                            <div className='service-list'><h1>Web Socket Connections</h1>
                            <div className={`service-status-badge ${websocketStatus ? 'operational' : websocketStatus === null ? 'unknown' : 'down'}`}></div></div>
                            <div className='service-list'><h1>Lavalink Connection</h1>
                            <div className={`service-status-badge operational`}></div></div>
                            <div className='service-list'><h1>Cloudflare Workers</h1>
                            <div className={`service-status-badge operational`}></div></div>
                            <div className='service-list'><h1>Shards Connection</h1>
                            <div className={`service-status-badge operational`}></div></div>
                            <div className='service-list'><h1>Cluster Connections</h1>
                            <div className={`service-status-badge ${(clusterInfoStatus && clusterInfoStatus.totalShards > 0) ? 'operational' : clusterInfoStatus === null ? 'unknown' : 'down'}`}></div></div>
                            <div className='service-list'><h1>Discord Gateway Connection</h1>
                            <div className={`service-status-badge operational`}></div></div>
                        </div>
                    </div>
                    <div className='flex gap-3 max-lg:flex-col'>
                        <div className='status-block'>
                            <h1 className='text-3xl'>Regions Loads</h1>
                            <div className='flex flex-col gap-4 mt-4'>
                                <div className='service-list'><h1>AP-TH_TH-10.0</h1>
                                <div className={`service-status-badge degraded`}></div></div>
                                <div className='service-list'><h1>AP-TH_TH-11.4</h1>
                                <div className={`service-status-badge operational`}></div></div>
                                <div className='service-list'><h1>AP-TH_TH-11.6</h1>
                                <div className={`service-status-badge operational`}></div></div>
                                <div className='service-list'><h1>AP-SG_1</h1>
                                <div className={`service-status-badge`}></div></div>
                            </div>
                        </div>
                        <div className='status-block'>
                            <h1 className='text-3xl'>Active Manager</h1>
                            <div className='w-full h-full relative'>
                                <ManagerChart />
                            </div>
                        </div>
                    </div>
                    <div className='flex gap-3'>
                        <div className='status-block'>
                            <h1 className='text-3xl'>Active Shards ({clusterInfoStatus ? clusterInfoStatus.totalShards : '0'})</h1>
                        </div>
                        <div className='status-block'>
                            <h1 className='text-3xl'>Active Cluster (1)</h1>
                        </div>
                    </div>
                </main>
            </div>
            <br/>
        </main>
    )
}

export default Status