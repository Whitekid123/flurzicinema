import {Suspense} from 'react';
import {JoinRoom} from '@/components/streaming/Rooms';
export default function Page(){return <Suspense fallback={<p role="status">Opening invitation…</p>}><JoinRoom/></Suspense>;}
