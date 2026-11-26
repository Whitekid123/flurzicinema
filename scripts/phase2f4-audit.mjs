import fs from 'node:fs/promises';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(await fs.readFile('docs/phase2f4/baseline.json','utf8'));
const planned=['next.config.ts','components/streaming/MediaPlayer.tsx','components/streaming/StoryLens.tsx','components/streaming/TitleDetails.tsx','components/streaming/AccountScreens.tsx','components/streaming/ProfileScreens.tsx','components/streaming/PlayerLab.tsx','lib/media-transport.ts','lib/api/services.ts','types/streaming.ts','components/public/FeatureShowcase.tsx','components/home/FeatureLab.tsx'];
const changed=[],protectedFiles=[],unexpected=[];
for(const [p,h] of Object.entries(baseline)){const current=hash(await fs.readFile(p));if(current===h)protectedFiles.push(p);else if(planned.includes(p))changed.push(p);else unexpected.push(p);}
assert.deepEqual(unexpected,[],'Original protected sources/config/log changed');
let assets=[];async function walk(d){for(const e of await fs.readdir(d,{withFileTypes:true})){const p=d+'/'+e.name;if(e.isDirectory())await walk(p);else assets.push(p);}}
const release=process.argv.includes('--release');let forbidden=[];
if(release){await walk('.next/static');await walk('.next/server');const needles=['Example A · illustrative','Example B · illustrative','isolated-transfer-','Use native unknown telemetry','Add example 1 MB transfer','original-study-source','FUTURE_TEST_SECRET','UNCLASSIFIED_TEST_SECRET','REVEALED_TEST_DETAIL','Test performer','demo@flurzi.example','preview-only','mock-verification-link','mock-reset','mock-verification','mock-account-1','test PIN 1234','synthetic-test-person','Synthetic biography'];
 for(const p of assets){const s=await fs.readFile(p);for(const value of needles)if(s.includes(value))forbidden.push({path:p,value});}assert.deepEqual(forbidden,[],'Release contains test values');
}
const result={changed,protectedCount:protectedFiles.length,protectedFiles,unexpected,release,assetCount:assets.length,forbidden};await fs.writeFile('docs/phase2f4/'+(release?'source-release-audit':'source-audit')+'.json',JSON.stringify(result,null,2));console.log(JSON.stringify({changed,protectedCount:protectedFiles.length,release,assetCount:assets.length,forbidden}));
