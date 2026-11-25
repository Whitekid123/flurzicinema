import {matchFail,type StoryMatchService} from '@/lib/storymatch';
// The existing RecommendationService supplies rails, not sessions or collaborative decisions.
// Install an approved cookie-session adapter here; never fall back to a mock in production.
const unavailable=async()=>matchFail('SERVICE_UNAVAILABLE');
export const unavailableStoryMatchService:StoryMatchService={capabilities:async()=>({available:false,isPreview:false,modes:[],genres:[],moods:[],participantLimit:0}),list:unavailable,create:unavailable,get:unavailable,submitPreferences:unavailable,generateResults:unavailable,shortlist:unavailable,vote:unavailable,finalize:unavailable,leave:unavailable,end:unavailable,resolveInvitation:unavailable,join:unavailable};
