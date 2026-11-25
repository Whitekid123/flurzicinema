import {chromium} from '@playwright/test';import fs from 'node:fs/promises';
console.log('Launching fixture browser');
const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required'],executablePath:'C:/Users/USER/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
console.log('Fixture browser launched');
try{const page=await browser.newPage();console.log('Recording original clip');const base64=await page.evaluate(async()=>{
 const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const ctx=canvas.getContext('2d');const stream=canvas.captureStream(30);
 const audio=new AudioContext();const oscillator=audio.createOscillator(),gain=audio.createGain(),destination=audio.createMediaStreamDestination();oscillator.frequency.value=220;gain.gain.value=.025;oscillator.connect(gain).connect(destination);oscillator.start();stream.addTrack(destination.stream.getAudioTracks()[0]);
 const chunks=[];const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus',videoBitsPerSecond:900000});
 const result=new Promise(resolve=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=async()=>{const blob=new Blob(chunks,{type:'video/webm'});const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(blob);};});
 const start=performance.now();function draw(){const elapsed=(performance.now()-start)/1000;ctx.fillStyle='#0b0d11';ctx.fillRect(0,0,1280,720);ctx.strokeStyle='#333740';ctx.lineWidth=1;for(let x=0;x<1280;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,720);ctx.stroke();}for(let y=0;y<720;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1280,y);ctx.stroke();}
 ctx.fillStyle='#f1f1ee';ctx.font='24px sans-serif';ctx.fillText('FLURZI CINEMA / ORIGINAL MOTION STUDY',64,84);ctx.font='72px sans-serif';ctx.fillText('A moment in motion.',64,218);ctx.font='24px monospace';ctx.fillStyle='#a7aab3';ctx.fillText(elapsed.toFixed(1)+' seconds / 20 seconds',64,275);
 const x=140+(elapsed/20)*1000;ctx.beginPath();ctx.arc(x,460,48,0,Math.PI*2);ctx.fillStyle='#ecece8';ctx.fill();ctx.fillStyle='#818794';ctx.fillRect(64,630,1152*Math.min(1,elapsed/20),3);
 if(elapsed<20)requestAnimationFrame(draw);else{recorder.stop();stream.getTracks().forEach(track=>track.stop());oscillator.stop();audio.close();}}
 recorder.start();draw();return result;
});
let bytes=Buffer.from(base64,'base64');
const info=bytes.indexOf(Buffer.from([0x15,0x49,0xa9,0x66]));if(info<0)throw Error('Missing WebM Info');
const offset=info+4;let length=1,mask=0x80;while(!(bytes[offset]&mask)){length++;mask>>=1;}
let size=bytes[offset]&~mask;for(let i=1;i<length;i++)size=size*256+bytes[offset+i];
const duration=Buffer.alloc(11);duration.set([0x44,0x89,0x88]);duration.writeDoubleBE(20000,3);
const sizeBytes=Buffer.alloc(length);let newSize=size+11;for(let i=length-1;i>=0;i--){sizeBytes[i]=newSize%256;newSize=Math.floor(newSize/256);}sizeBytes[0]|=mask;
bytes=Buffer.concat([bytes.subarray(0,offset),sizeBytes,bytes.subarray(offset+length,offset+length+size),duration,bytes.subarray(offset+length+size)]);
await fs.mkdir('scripts/fixtures/player',{recursive:true});await fs.writeFile('scripts/fixtures/player/original.webm',bytes);
await fs.writeFile('scripts/fixtures/player/captions.vtt','WEBVTT\n\n00:00:00.000 --> 00:00:08.000\nAn original motion study for player testing.\n\n00:00:08.000 --> 00:00:20.000\nA moving circle marks the passing seconds.\n');
await fs.writeFile('scripts/fixtures/player/README.md','# Original player test fixture\n\nGenerated locally by scripts/generate-player-fixture.mjs using canvas, a moving circle, original text and a quiet synthesized tone. No third-party footage, music, fonts or artwork. 20-second VP8/Opus WebM. English captions describe this clip only. Not associated with any catalog title. Served only by an explicitly enabled development server.\n');console.log('Original fixture generated:',bytes.length,'bytes');
}finally{await browser.close();}
