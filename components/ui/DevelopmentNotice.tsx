"use client";
import {mockMode} from '@/lib/api/client';
export function DevelopmentNotice(){return mockMode?<p className="development-notice" role="note"><strong>Development preview</strong> Use fictional details. Local changes reset on refresh. No payment, email delivery or streaming access.</p>:null;}
