import {StoryMatchSession} from '@/components/streaming/StoryMatch';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <StoryMatchSession key={id} id={id}/>;}
