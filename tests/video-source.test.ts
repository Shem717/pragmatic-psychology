import test from 'node:test';
import assert from 'node:assert/strict';
import { parseYouTubeSource, buildYouTubeEmbedUrl } from '../lib/video-source';
import { supportingPractices } from '../lib/supporting-practices';
import { content } from '../lib/content';

const id = 'TOTW_bsKkbE';
test('current selected and supporting YouTube sources retain their exact timestamp', () => {
  for (const practice of supportingPractices) for (const source of practice.sources) {
    const url=new URL(source.url);
    assert.deepEqual(parseYouTubeSource(source.url),{videoId:url.searchParams.get('v'),start:Number(url.searchParams.get('t'))});
  }
  for (const video of content.videos) {
    assert.deepEqual(parseYouTubeSource(`https://www.youtube.com/watch?v=${video.youtubeId}`),{videoId:video.youtubeId,start:0});
    for(const takeaway of video.takeaways ?? []) assert.deepEqual(parseYouTubeSource(`https://www.youtube.com/watch?v=${video.youtubeId}&t=${takeaway.seconds || 0}s`),{videoId:video.youtubeId,start:takeaway.seconds || 0});
  }
});
test('supported HTTPS watch, short and privacy-enhanced embed URLs normalize safely', () => {
  for(const url of [`https://youtube.com/watch?v=${id}&t=167`,`https://www.youtube.com/watch?v=${id}&t=167s`,`https://m.youtube.com/watch?v=${id}&start=167`,`https://youtu.be/${id}?t=2m47s`,`https://youtube.com/embed/${id}?start=167`,`https://youtube-nocookie.com/embed/${id}?start=167`,`https://www.youtube-nocookie.com/embed/${id}?start=167`]) assert.deepEqual(parseYouTubeSource(url),{videoId:id,start:167});
  assert.deepEqual(parseYouTubeSource(`https://youtu.be/${id}?t=1h2m3s`),{videoId:id,start:3723});
  assert.deepEqual(parseYouTubeSource(`https://youtu.be/${id}#t=1m`),{videoId:id,start:60});
  assert.deepEqual(parseYouTubeSource(`https://youtu.be/${id}?t=60&start=1m`),{videoId:id,start:60});
  assert.deepEqual(parseYouTubeSource(`https://youtu.be/${id}?t=0`),{videoId:id,start:0});
});
test('malformed, ambiguous or unsupported sources remain external rather than playing the wrong video or time', () => {
  const invalid = [
    `http://www.youtube.com/watch?v=${id}`, `javascript:alert(1)`, `//youtu.be/${id}`,
    `https://youtube.com.evil.example/watch?v=${id}`, `https://evil.example/?v=${id}`,
    `https://user:password@youtube.com/watch?v=${id}`, `https://youtube.com:444/watch?v=${id}`,
    `https://youtube-nocookie.com/watch?v=${id}`, `https://youtube.com/shorts/${id}`,
    `https://youtube.com/watch?v=${id}&v=CorAKleaql4`, `https://youtu.be/${id}/extra`,
    `https://youtube.com/watch?v=short`, `https://youtube.com/watch?v=${id}x`,
    `https://youtube.com/watch?v=%3Cscript%3E`, `https://youtu.be/${id}?v=CorAKleaql4`,
    `https://you\ntube.com/watch?v=${id}`,
  ];
  for(const time of ['', '-1','1.5','NaN','Infinity','0x10','1e3',' 12','1m2h','12seconds','1h2h','1h2m3s4','999999999999999999999999']) invalid.push(`https://youtu.be/${id}?t=${encodeURIComponent(time)}`);
  invalid.push(`https://youtu.be/${id}?t=1&t=1`,`https://youtu.be/${id}?t=1&start=2`,`https://youtu.be/${id}?start=invalid`,`https://youtu.be/${id}?t=1#t=2`);
  for(const url of invalid) assert.equal(parseYouTubeSource(url),null,url);
});
test('safe embeds use nocookie, inline playback and validated seconds without autoplay', () => {
  const embed = new URL(buildYouTubeEmbedUrl({videoId:id,start:167}));
  assert.equal(embed.origin,'https://www.youtube-nocookie.com');
  assert.equal(embed.pathname,`/embed/${id}`);
  assert.equal(embed.searchParams.get('rel'),'0');
  assert.equal(embed.searchParams.get('playsinline'),'1');
  assert.equal(embed.searchParams.get('start'),'167');
  assert.equal(embed.searchParams.has('autoplay'),false);
  assert.deepEqual(parseYouTubeSource(embed.toString()),{videoId:id,start:167});
  assert.throws(()=>buildYouTubeEmbedUrl({videoId:'../bad',start:0}),TypeError);
  for(const start of [-1,1.5,Infinity,NaN,Number.MAX_SAFE_INTEGER+1]) assert.throws(()=>buildYouTubeEmbedUrl({videoId:id,start}),RangeError);
});
