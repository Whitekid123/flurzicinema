import {RoomDetail} from '@/components/streaming/Rooms';
export default async function Page({params}:{params:Promise<{roomId:string}>}){const {roomId}=await params;return <RoomDetail key={roomId} id={roomId}/>;}
