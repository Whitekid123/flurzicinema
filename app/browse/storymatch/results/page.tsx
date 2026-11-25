import {Suspense} from 'react';
import {StoryMatchResultsRoute} from '@/components/streaming/StoryMatch';
export default function Page(){return <Suspense fallback={<p role="status">Opening your results…</p>}><StoryMatchResultsRoute/></Suspense>;}
