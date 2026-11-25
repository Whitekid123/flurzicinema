import {describe,it,expect,vi} from 'vitest';
import {usesDevelopmentServices} from '@/lib/api/environment';
import {authenticationError} from '@/lib/api/customer-errors';
import {serviceDeadline} from '@/lib/api/deadline';
describe('release separation and bounded requests',()=>{
 it.each([['production','1',undefined,false],['production','1','release',false],['production','1','preview',true],['production',undefined,'preview',false],['development','1',undefined,true],['development','0',undefined,false]])('checks %s %s %s',(env,mocks,channel,enabled)=>expect(usesDevelopmentServices(env as string,mocks as string|undefined,channel as string|undefined)).toBe(enabled));
 it('does not surface transport details',()=>{expect(authenticationError({code:'SERVICE_UNAVAILABLE',message:'secret backend host'})).toBe('Unable to complete your request. Please try again.');});
 it('bounds an unanswered request',async()=>{vi.useFakeTimers();try{const result=expect(serviceDeadline(new Promise(()=>{}),20)).rejects.toMatchObject({code:'TIMEOUT'});await vi.advanceTimersByTimeAsync(21);await result;}finally{vi.useRealTimers();}});
 it('preserves a confirmed response and service failure',async()=>{await expect(serviceDeadline(Promise.resolve('confirmed'))).resolves.toBe('confirmed');const error={code:'ACCESS_DENIED'};await expect(serviceDeadline(Promise.reject(error))).rejects.toBe(error);});
});
