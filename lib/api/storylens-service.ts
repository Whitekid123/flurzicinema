import {ServiceError} from './errors';
import type {StoryLensService} from '../storylens';
export const unavailableStoryLensService:StoryLensService={async getContext(){throw new ServiceError({code:'SERVICE_UNAVAILABLE',message:'StoryLens is currently unavailable.'});}};
