export type ObservatoryStation = 'telescope' | 'practice' | 'evidence';
export const observatoryStations: {id: ObservatoryStation; title: string; subtitle: string; roman: string}[] = [
  { id:'telescope',title:'Perspective Telescope',subtitle:'Hold the facts. Change the lens.',roman:'I' },
  { id:'practice',title:'Practice Orrery',subtitle:'Predict. Act. Observe. Revise.',roman:'II' },
  { id:'evidence',title:'Evidence Desk',subtitle:'Inspect the claim and its limits.',roman:'III' },
];
export type ObservatoryState = {station:ObservatoryStation|null; plain:boolean; failure:string|null; ready:boolean; attempt:number};
export const initialObservatoryState: ObservatoryState = {station:null,plain:false,failure:null,ready:false,attempt:0};
export type ObservatoryAction = {type:'station';station:ObservatoryStation}|{type:'hall'}|{type:'plain'}|{type:'retry'}|{type:'ready'}|{type:'failure';reason:string};
export function observatoryReducer(state:ObservatoryState,action:ObservatoryAction):ObservatoryState {
  switch(action.type) {
    case 'station':return {...state,station:action.station};
    case 'hall':return {...state,station:null};
    case 'plain':return {...state,plain:true};
    case 'retry':return {...state,plain:false,failure:null,ready:false,attempt:state.attempt+1};
    case 'ready':return {...state,ready:true};
    case 'failure':return {...state,failure:action.reason,ready:false};
  }
}
export function showObservatoryScene(state:ObservatoryState, focused:boolean, phone:boolean) {
  return !state.plain && !state.failure && !focused && !phone;
}
export const practiceSteps = [
  {id:'prediction',title:'Prediction',stage:1,field:'prediction',prompt:'What do you expect, and what would challenge that expectation?'},
  {id:'action',title:'Action',stage:3,field:'action',prompt:'Choose or rehearse one observable action within your authority.'},
  {id:'observation',title:'Observation',stage:4,field:'',prompt:'Record what actually happened. Keep imagined, role-play and real-world observations distinct.'},
  {id:'revision',title:'Revision',stage:5,field:'revision',prompt:'What does the evidence support, and what remains untested?'},
] as const;
