// A production-optimized preview is a separate, explicitly labelled build artifact.
export function usesDevelopmentServices(environment:string|undefined,mocks:string|undefined,channel:string|undefined){
 return mocks==='1'&&(environment!=='production'||channel==='preview');
}
