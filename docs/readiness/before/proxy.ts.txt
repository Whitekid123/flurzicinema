import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

// Keep developer media outside production before any streamed page headers.
export function proxy(request:NextRequest){
 const privateFixture=request.nextUrl.pathname.startsWith("/scripts/fixtures/player");
 if(privateFixture||process.env.NODE_ENV!=="development"||process.env.FLURZI_PLAYER_LAB!=="1"){
  return new NextResponse(null,{status:404,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
 }
 return NextResponse.next();
}
export const config={matcher:["/player-lab/:path*","/api/player-lab/:path*","/scripts/fixtures/player/:path*"]};
