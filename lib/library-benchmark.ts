import type { BenchmarkConfiguration } from '@/features/library-benchmark/BenchmarkScene';

/** Experimental asset study only; never expands the seven-volume collection. */
export const libraryBenchmark:BenchmarkConfiguration={
  models:[
    {id:'shelf-bay',url:'/art/library-benchmark/shelf-bay.glb',position:[0,0,0]},
    {id:'celestial-armillary',url:'/art/library-benchmark/celestial-armillary.glb',position:[5,5.4,.1]},
  ],
  views:[
    {id:'reference',label:'Reference-facing view',position:[13,10,21],target:[2.3,4,0],fov:32.1994266},
    {id:'craft',label:'Shelf craftsmanship',position:[4,4.8,10],target:[0,3.7,.1],fov:39.5977541},
    {id:'centerpiece',label:'Celestial centerpiece',position:[9,6.8,11],target:[5,5.4,.1],fov:38},
  ],
  lights:[
    {position:[-4,6,5],target:[0,3,0],color:'#ffcb8c',intensity:12,width:5,height:5},
    {position:[5,9,-2],target:[3,4,0],color:'#88b1ff',intensity:18,width:4,height:4},
    {position:[4,5,7],target:[2,4,0],color:'#bfd7ff',intensity:5,width:6,height:6},
  ],
  shadowKey:{position:[-4,6,5],target:[0,3,0],color:'#ffd0a0',intensity:1.4,extent:10},
  shelfLights:[1.3,2.2,3.1,4,4.9].map(y=>({position:[0,y,.55] as [number,number,number],color:'#ffb665',intensity:2.5,distance:3})),
  background:'#03060d',exposure:1,environmentIntensity:.3,fov:32.1994266,
};
export const benchmarkMaterialNotes=[
  'The shelf bay, carved trim, leather-bound decorative books, brass rings and celestial centerpiece are modeled geometry imported from Blender GLB files.',
  'Marble, leather and brass use authored image-based PBR materials. Ambient occlusion is genuinely baked for eight shelf materials, using their own preserved UV channels—not painted over a flat scene.',
  'Area lights, a bounded shadow-casting key, shelf lights, reflection environment and glass transmission are rendered live. The glowing strips alone do not illuminate the books; no full static illumination bake is claimed.',
  'This isolated study loads about 12.5 MB of model and texture data on a capable larger screen. It is not loaded by the main Library or other pages.',
];
