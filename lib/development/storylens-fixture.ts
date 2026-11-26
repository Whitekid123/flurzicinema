// Original protected media only. No catalog, commercial credits or metadata adapter uses this test fixture.
import type {CatalogTitle} from '@/types/streaming';
import type {LensRecord,StoryLensContext,StoryLensService} from '../storylens';
export const lensLabTitle:CatalogTitle={id:'original-player-test',slug:'original-motion-study',mediaType:'movie',title:'Motion study',genres:[],cast:[],artwork:{},availability:{status:'licensed'},isLicensedForPlayback:true};
const source={label:'Original motion study · test editorial metadata',reviewedAt:'2026-11-25T00:00:00Z'};
const record=(id:string,category:LensRecord['category'],heading:string,text:string,spoiler:LensRecord['spoiler']={classification:'safe'}):LensRecord=>({id,category,heading,text,spoiler,source:{...source}});
export function lensLabContext():StoryLensContext{return {
 titleId:lensLabTitle.id,profileId:'lab-viewer',version:'motion-study-test-v1',expiresAt:new Date(Date.now()+3600000).toISOString(),availability:'available',
 capabilities:['cast','insights','music','locations','related'],
 records:[
 record('study-format','insights','An original motion study','This generated clip lasts twenty seconds and uses original geometric artwork.'),
 {...record('test-person','cast','Test performer','Synthetic biography for interface testing only. This is not a real cast credit.'),personId:'synthetic-test-person',character:'Synthetic test character',role:'Test-only cast record'},
 {...record('study-tone','music','A synthesized tone','An original quiet tone was generated for this clip.'),artist:'Generated test audio'},
 record('study-location','locations','A generated canvas','This clip was rendered digitally, without a filming location.'),
 record('future-test','insights','FUTURE_TEST_SECRET','Test-only plot detail eligible at twelve seconds.',{classification:'plot',revealAtSeconds:12}),
 record('unknown-test','insights','UNCLASSIFIED_TEST_SECRET','Must never appear.',{classification:'unknown'})
 ],
 annotations:[
 {id:'first-half',startSeconds:0,endSeconds:10,records:[record('early-scene','insights','The opening study','You are within the first ten seconds of this original clip.')]},
 {id:'second-half',startSeconds:10,endSeconds:20,records:[
 record('later-scene','insights','The second half','You are within the final ten seconds of this original clip.'),
 record('scene-spoiler','insights','REVEALED_TEST_DETAIL','A deliberately classified test detail for this segment.',{classification:'plot',revealAtSeconds:10})]}
 ]
};}
export const lensLabService:StoryLensService={async getContext(){return lensLabContext();}};
