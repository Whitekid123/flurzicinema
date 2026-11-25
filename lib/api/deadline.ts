import {ServiceError} from './errors';
export function serviceDeadline<T>(operation:Promise<T>,milliseconds=20000):Promise<T>{
 return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new ServiceError({code:'TIMEOUT',message:'The request took too long. Please try again.'})),milliseconds);operation.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});
}
