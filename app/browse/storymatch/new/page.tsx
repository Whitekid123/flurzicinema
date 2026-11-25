import {Suspense} from 'react';
import {NewStoryMatch} from '@/components/streaming/StoryMatch';
export default function Page(){return <Suspense fallback={<p role="status">Preparing your match…</p>}><NewStoryMatch/></Suspense>;}
