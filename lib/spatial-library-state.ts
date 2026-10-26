import { getLibraryVolume, libraryCategories, type LibraryCategoryId } from './spatial-library';
export type SpatialLibraryState = { category: LibraryCategoryId | null; bookId: string | null; entered: boolean; ready: boolean; failure: string | null; attempt: number };
export const initialSpatialLibraryState: SpatialLibraryState = { category:null,bookId:null,entered:false,ready:false,failure:null,attempt:0 };
export type SpatialLibraryAction = {type:'enter'}|{type:'category';category:LibraryCategoryId}|{type:'book';id:string}|{type:'close-book'}|{type:'hall'}|{type:'catalog'}|{type:'ready'}|{type:'failure';reason:string};
export function spatialLibraryReducer(state:SpatialLibraryState,action:SpatialLibraryAction):SpatialLibraryState {
  switch(action.type) {
    case 'enter': return {...state,entered:true,ready:false,failure:null,attempt:state.attempt+1};
    case 'category': return libraryCategories.some((category)=>category.id===action.category) ? {...state,category:action.category,bookId:null} : state;
    case 'book': {const book=getLibraryVolume(action.id);return book ? {...state,category:book.category,bookId:book.id} : state;}
    case 'close-book': return {...state,bookId:null};
    case 'hall': return {...state,category:null,bookId:null};
    case 'catalog': return {...state,entered:false,ready:false,bookId:null};
    case 'ready': return {...state,ready:true};
    case 'failure': return {...state,entered:false,ready:false,failure:action.reason};
  }
}
export function mayRenderLibraryScene({entered,focused,phone,failure}:{entered:boolean;focused:boolean;phone:boolean;failure:string|null}) {
  return entered && !focused && !phone && !failure;
}
