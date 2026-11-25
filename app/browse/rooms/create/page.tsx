import {CreateRoom} from '@/components/streaming/Rooms';
export default async function Page({searchParams}:{searchParams:Promise<{titleId?:string;episodeId?:string}>}){
 const params=await searchParams;
 return <CreateRoom initialMedia={typeof params.titleId==='string'&&params.titleId.length<=200?{titleId:params.titleId,episodeId:typeof params.episodeId==='string'&&params.episodeId.length<=200?params.episodeId:undefined}:undefined}/>;
}
