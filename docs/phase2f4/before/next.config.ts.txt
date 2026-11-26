import {usesDevelopmentServices} from "./lib/api/environment";
import type { NextConfig } from "next";
if(process.env.NODE_ENV==='production'&&process.env.NEXT_PUBLIC_USE_MOCKS==='1'&&!usesDevelopmentServices("production",process.env.NEXT_PUBLIC_USE_MOCKS,process.env.NEXT_PUBLIC_FLURZI_CHANNEL)){
 throw new Error('Mock services require an explicit preview build. Clear NEXT_PUBLIC_USE_MOCKS for a release.');
}
const nextConfig: NextConfig = { poweredByHeader: false, devIndicators: false };
export default nextConfig;
