import {readFile} from "node:fs/promises";
import path from "node:path";
export const dynamic="force-dynamic";
export async function GET(request:Request,{params}:{params:Promise<{asset:string}>}){
 if(process.env.NODE_ENV!=="development"||process.env.FLURZI_PLAYER_LAB!=="1")return new Response(null,{status:404});
 const {asset}=await params;
 if(!["original.webm","captions.vtt","broken.webm"].includes(asset))return new Response(null,{status:404});
 if(asset==="broken.webm")return new Response("Invalid development media",{headers:{"Content-Type":"video/webm","Cache-Control":"no-store"}});
 let bytes:Buffer;try{bytes=await readFile(path.join(process.cwd(),"scripts","fixtures","player",asset));}catch{return new Response("Generate the original player fixture first.",{status:404});}
 const headers:Record<string,string>={"Content-Type":asset.endsWith(".vtt")?"text/vtt":"video/webm","Cache-Control":"no-store","Accept-Ranges":"bytes"};
 const range=request.headers.get("range");
 if(range){
  const match=/^bytes=(\d+)-(\d*)$/.exec(range);if(!match)return new Response(null,{status:416,headers:{"Content-Range":"bytes */"+bytes.length}});
  const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),bytes.length-1):bytes.length-1;
  if(start>end||start>=bytes.length)return new Response(null,{status:416,headers:{"Content-Range":"bytes */"+bytes.length}});
  headers["Content-Range"]="bytes "+start+"-"+end+"/"+bytes.length;headers["Content-Length"]=String(end-start+1);return new Response(new Uint8Array(bytes.subarray(start,end+1)),{status:206,headers});
 }
 headers["Content-Length"]=String(bytes.length);return new Response(new Uint8Array(bytes),{headers});
}
