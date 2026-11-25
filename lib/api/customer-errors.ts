import {toServiceError} from './errors';
export function authenticationError(error:unknown){
 const code=toServiceError(error).code;
 if(code==='RATE_LIMITED')return 'Too many attempts. Please wait a moment and try again.';
 if(code==='UNAUTHENTICATED'||code==='INVALID_CREDENTIALS')return 'Check your email and password and try again.';
 if(code==='SESSION_EXPIRED')return 'Your session has expired. Please sign in again.';
 if(code==='VALIDATION')return 'Check your details or request a new link, then try again.';
 return 'Unable to complete your request. Please try again.';
}
