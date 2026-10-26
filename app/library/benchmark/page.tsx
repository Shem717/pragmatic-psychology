import { LibraryBenchmark } from '@/features/library-benchmark/LibraryBenchmark';
import { libraryBenchmark,benchmarkMaterialNotes } from '@/lib/library-benchmark';
export const metadata={title:'Library Material Study · Experimental',description:'An isolated browser benchmark of Blender-authored library architecture and materials, not a replacement of the working Library.',robots:{index:false,follow:true},alternates:{canonical:'/library/benchmark'}};
export default function Page(){return <LibraryBenchmark configuration={libraryBenchmark} previewUrl="/art/library-benchmark/benchmark-preview.webp" previewWidth={1400} previewHeight={1100} materialNotes={benchmarkMaterialNotes}/>;}
