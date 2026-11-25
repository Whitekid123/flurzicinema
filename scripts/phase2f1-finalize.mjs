import fs from 'node:fs/promises';
import net from 'node:net';
const dir='docs/phase2f1';
const observations=JSON.parse(await fs.readFile(dir+'/observations.json','utf8'));
const audit=JSON.parse(await fs.readFile(dir+'/source-audit.json','utf8'));
if(observations.browser!=='passed'||audit.changed.length)throw new Error('Final evidence is not passing.');
const teardown=await new Promise(resolve=>{const socket=net.createConnection({host:'127.0.0.1',port:3011});socket.setTimeout(1500);socket.once('connect',()=>{socket.destroy();resolve({port:3011,closed:false});});socket.once('error',error=>resolve({port:3011,closed:error.code==='ECONNREFUSED',code:error.code}));socket.once('timeout',()=>{socket.destroy();resolve({port:3011,closed:false,code:'TIMEOUT'});});});
const buildId=(await fs.readFile('.next/BUILD_ID','utf8')).trim();
const validation={typecheck:'passed',lint:{status:'passed',warnings:0},build:{status:'passed',staticPages:50,buildId},unit:{defaultParallel:'failed on unchanged account date/currency initialization timeouts',singleWorker:{command:'npm run test:unit -- --maxWorkers=1',status:'passed',files:7,tests:177,newRoomTests:38}},browser:{status:observations.browser,viewportChecks:observations.viewports.length,pageErrors:observations.errors.length,engine:'Chromium; emulated viewport/touch contexts'},sourceAudit:{unchangedProtectedFiles:audit.protected.length,unexpectedChanges:audit.changed},teardown};
await fs.writeFile(dir+'/validation.json',JSON.stringify(validation,null,2));
await fs.writeFile(dir+'/server-teardown.json',JSON.stringify(teardown,null,2));
let report=await fs.readFile('docs/PHASE_2F1_IMPLEMENTATION_REPORT.md','utf8');
report=report.replace(/## Validation[\s\S]*$/,[
'## Validation',
'',
'- npm run typecheck: PASS. The final build also passed its TypeScript step.',
'- npm run lint: PASS, zero warnings.',
'- npm run build: PASS with default Turbopack; 50 static pages generated. Build ID: '+buildId+'.',
'- npm run test:unit: the default parallel run encountered the pre-existing account date/currency initialization timeouts. All new room tests passed in those attempts. npm run test:unit -- --maxWorkers=1: PASS, all 177 tests across seven files, including 38 room tests. No timeout or shared configuration was changed. Vitest retains its existing config-loader compatibility warning.',
'- Room unit coverage: permissions, readiness, lifecycle, host changes, room/profile/media identity, ordering, stale/duplicate events, reaction deduplication/rate limits, reconnect, invitation syntax/expiry, unknown codes, independent-auth/profile isolation, fail-closed production services, logout denial and bounded requests.',
'- Source audit: PASS, all 149 protected sources/configuration files match the initial baseline; only the two planned integration files changed.',
'- Owned production-preview HTTP checks: all four room routes return 200; these alone do not establish authentication. The developer lab page, real video/caption/broken-media API paths and private fixture asset return 404.',
'- Focused Chromium browser flow: PASS, '+observations.viewports.length+' viewport/screen checks with zero horizontal overflow or checked heading/label/button clipping. Home, create, join, lobby and viewing were checked at 1920, 1440, 1024, 768, 390 and 320px; ended, separate 390px touch viewing and 844×390 landscape were also captured.',
'- Normal demo sign-in, plan preference and profile selection were used without guard bypass. Tested search/catalog selection, confirmed creation, current-room return, invitation resolve/join and invalid/external links, readiness/start gating, metadata-only playback denial, one actual participant, confirmed self reaction/mute, participant collapse, distraction-free mode, simulated connection loss/reconnect/access recheck, keyboard dialog trapping/Escape/focus restoration, mobile dialog bounds, confirmed end/leave and profile-separated invitations.',
'- Separate touch context exercised creation, readiness, viewing, reactions, reduced-motion styling, landscape and confirmed leave.',
'- No browser page errors were recorded. Owned preview teardown: '+(teardown.closed?'port 3011 refused connections after shutdown.':'see server-teardown.json; closure not confirmed.')+' The user development server was not stopped.',
'',
'The first browser attempt passed 18 responsive checks, then stopped on a harness locator matching both room feedback and the Next route announcer. That evidence is retained. The scoped selector and complete focused flow were rerun against the final production build. The existing full Playwright configuration and deferred investigation were left unchanged.',
'',
'Desktop home and lobby, 320px creation/viewing and the mobile confirmation dialog were visually inspected. Browser checks use Chromium with emulated viewports/touch. Physical devices and Safari/Firefox were not tested. Real production participants, transport timing, host transfer/removal, moderation, licensed room playback and cross-device synchronization remain unverified without adapters. The optional player bridge was not browser-tested with licensed room media; the current catalog correctly creates no video. No fake production data or entitlements were inserted.',
'',
'See [backend contracts](./CINEMA_ROOMS_BACKEND_CONTRACTS.md), [validation](./phase2f1/validation.json), [source audit](./phase2f1/source-audit.json), [browser observations](./phase2f1/observations.json), [first attempt](./phase2f1/attempt-1.json) and [teardown](./phase2f1/server-teardown.json).',
'',
'[Desktop home](./phase2f1/1440-home.png) · [Desktop lobby](./phase2f1/1440-lobby.png) · [320px creation](./phase2f1/320-create.png) · [320px viewing](./phase2f1/320-viewing.png) · [390px confirmation](./phase2f1/390-leave-dialog.png)',
''
].join('\n'));
await fs.writeFile('docs/PHASE_2F1_IMPLEMENTATION_REPORT.md',report);
console.log(JSON.stringify(validation,null,2));
if(!teardown.closed)process.exitCode=1;
