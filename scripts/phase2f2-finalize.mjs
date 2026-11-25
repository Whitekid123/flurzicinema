import fs from 'node:fs/promises';
import net from 'node:net';
const dir='docs/phase2f2';
const observations=JSON.parse(await fs.readFile(dir+'/observations.json','utf8'));
const audit=JSON.parse(await fs.readFile(dir+'/source-audit.json','utf8'));
if(observations.browser!=='passed'||audit.changed.length)throw new Error('Final evidence is not passing.');
const teardown=await new Promise(resolve=>{const socket=net.createConnection({host:'127.0.0.1',port:3012});socket.setTimeout(1500);socket.once('connect',()=>{socket.destroy();resolve({port:3012,closed:false});});socket.once('error',error=>resolve({port:3012,closed:error.code==='ECONNREFUSED',code:error.code}));socket.once('timeout',()=>{socket.destroy();resolve({port:3012,closed:false,code:'TIMEOUT'});});});
const buildId=(await fs.readFile('.next/BUILD_ID','utf8')).trim();
const validation={typecheck:'passed',lint:{status:'passed',warnings:0},build:{status:'passed',staticPages:53,buildId},unit:{command:'npm run test:unit -- --maxWorkers=1',status:'passed',files:8,tests:235,newStoryMatchTests:58,initialAttempt:'Existing account date-formatting initialization timed out while build was active; unchanged retry passed.'},browser:{status:observations.browser,viewportChecks:observations.viewports.length,pageErrors:observations.errors.length,engine:'Chromium; emulated touch/viewport contexts'},sourceAudit:{unchangedProtectedFiles:audit.protected.length,unexpectedChanges:audit.changed},teardown};
await fs.writeFile(dir+'/validation.json',JSON.stringify(validation,null,2));await fs.writeFile(dir+'/server-teardown.json',JSON.stringify(teardown,null,2));
let report=await fs.readFile('docs/PHASE_2F2_IMPLEMENTATION_REPORT.md','utf8');
const evidence=[
'## Validation',
'',
'- npm run typecheck: PASS. Final production build also passed TypeScript.',
'- npm run lint: PASS, zero warnings.',
'- npm run build: PASS with default Turbopack, 53 static pages generated. Final build ID: '+buildId+'.',
'- npm run test:unit -- --maxWorkers=1: PASS, 235 tests across eight files, including all 58 StoryMatch tests and the prior 177. The initial single-worker attempt hit the unchanged account date-formatting initialization timeout while the build was active; the unchanged retry passed. No test timeout/configuration was modified. Vitest retains its existing config-loader compatibility warning.',
'- Focused unit coverage: preference validation, strict exclusions/type/rating/period, runtime boundaries and unknown metadata, exact episode selection, solo/two-viewer/group fairness, compromises, transparent explanations, ties/diversity, conflicting constraints/no matches, session ownership, stale requests/revisions, expiry, profile/auth isolation, explicit responses/votes/shortlists/decision, production fail-closed behavior and room identity handoff.',
'- Source audit: PASS, all 171 protected source/test/configuration files unchanged outside the three planned integration files.',
'- Owned production-preview HTTP checks: the four StoryMatch destinations returned 200. These statuses alone do not prove authentication. Normal demo sign-in, plan preference and selected-profile guards were separately exercised. The protected developer player page/media remained 404.',
'- Focused Chromium browser flow: PASS; '+observations.viewports.length+' viewport/screen checks with zero horizontal overflow or checked heading/label/button clipping, and no recorded page errors. Home, creation, moods, evening preferences, boundaries, results and Group were checked at 1920, 1440, 1024, 768, 390 and 320px; final decision, no-match, group decision, separate 390px touch results and 844×390 landscape were also captured.',
'- Verified actual mode/session creation; mood selection/deselection, reset, Back, skip and consent; results; My List save and detail/navigation persistence; shortlisting, separate explicit votes, host confirmation, keyboard dialog trapping/Escape/focus restoration and mobile bounds.',
'- Verified Together waiting/completion/compromise and confirmed participant removal; Group conflicting hard restrictions/no-match, explicit refinement preserving another viewer’s exclusion, independent entered votes and final decision without unanimity claims.',
'- Verified movie selection through the existing confirmed RoomService flow and exact supplied episode/runtime preselection without automatic room creation; confirmed match end; profile-separated session lists and blocked Kids matching.',
'- Separate touch context used actual taps through a complete preference/results flow, system reduced motion and landscape.',
'- Owned preview teardown: '+(teardown.closed?'port 3012 returned ECONNREFUSED after shutdown.':'see server-teardown.json; closure not confirmed.')+' No user development server was stopped. Shared Playwright/Vitest configuration and the deferred full Playwright investigation were unchanged.',
'',
'Initial browser attempts are retained: [launch timeout](./phase2f2/attempt-1-launch.json) and [invitation feedback failure](./phase2f2/attempt-2-invitation.json). Chromium initially timed out before opening a page. The next run caught internal code-only errors receiving generic feedback; the mapper and regression assertions were corrected before rebuilding and rerunning. A later [voter selector check](./phase2f2/attempt-3-voter.json) led to an explicit accessible name for the wrapped vote dropdown. A subsequent [profile-switch harness failure](./phase2f2/attempt-4-profile-harness.json) came from resolving the link without invoking click; the harness was corrected without changing the profile implementation. Application assertion timeouts and shared test configuration were not changed.',
'',
'Desktop home/results, mobile mood selection and confirmation, and 320px boundaries/results were visually inspected. Browser checks use Chromium with emulated viewports/touch; physical devices and Safari/Firefox were not tested. Production invitations, independently connected users, server concurrency, recommendation quality, parental catalog authorization and licensed room playback remain unverified without adapters. No live multi-user collaboration is claimed.',
'',
'See [backend contracts](./STORYMATCH_BACKEND_CONTRACTS.md), [validation](./phase2f2/validation.json), [browser observations](./phase2f2/observations.json), [source audit](./phase2f2/source-audit.json) and [teardown](./phase2f2/server-teardown.json).',
'',
'[Desktop home](./phase2f2/1440-home.png) · [Mobile moods](./phase2f2/390-mood.png) · [Desktop results](./phase2f2/1440-results.png) · [320px boundaries](./phase2f2/320-boundaries.png) · [390px confirmation](./phase2f2/390-decision-dialog.png)',
'',
'## Known limitations'
].join('\n');
report=report.replace(/## Validation[\s\S]*?## Known limitations/,evidence);
await fs.writeFile('docs/PHASE_2F2_IMPLEMENTATION_REPORT.md',report);
console.log(JSON.stringify(validation,null,2));if(!teardown.closed)process.exitCode=1;
