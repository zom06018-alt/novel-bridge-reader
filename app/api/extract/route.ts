function validate(value:string){
 const u=new URL(value);const h=u.hostname.toLowerCase();
 if(!['https:','http:'].includes(u.protocol)||u.username||u.password||(u.port&&!['80','443'].includes(u.port))||!h.includes('.')||!/^[a-z0-9.-]+$/.test(h)||/^\d+\./.test(h)||/(^|\.)(localhost|local|internal|test|invalid|example|onion)$/.test(h)||h.endsWith('.arpa'))throw new Error('공개 웹사이트의 HTTP 또는 HTTPS 주소가 필요하와요.');
 return u;
}
async function readLimited(response:Response){
 const reader=response.body?.getReader();if(!reader)throw new Error('페이지 본문이 없사와요.');let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2_000_000)throw new Error('페이지 용량이 크므로 본문 붙여넣기를 이용해 주시와요.');chunks.push(value)}}finally{await reader.cancel()}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}let charset=/charset=["']?([^;\s"']+)/i.exec(response.headers.get('content-type')||'')?.[1]||'utf-8';const head=new TextDecoder().decode(bytes.slice(0,4096));charset=/charset=["']?([^\s"'/>;]+)/i.exec(head)?.[1]||charset;try{return new TextDecoder(charset).decode(bytes)}catch{return new TextDecoder().decode(bytes)}
}
export async function POST(req:Request){
 try{
  if(Number(req.headers.get('content-length'))>10000)return Response.json({error:'주소가 너무 길사와요.'},{status:400});
  const {url}=await req.json();if(typeof url!=='string'||url.length>4000)throw new Error('올바른 주소를 입력해 주시와요.');let current=validate(url);let response:Response|undefined;
  for(let i=0;i<5;i++){response=await fetch(current.toString(),{redirect:'manual',signal:AbortSignal.timeout(15000),headers:{Accept:'text/html,text/plain','User-Agent':'BetweenLinesReader/1.0'}});if([301,302,303,307,308].includes(response.status)){const location=response.headers.get('location');await response.body?.cancel();if(!location)throw new Error('이동 주소를 찾지 못했사와요.');current=validate(new URL(location,current).href);continue}break;}
  if(!response?.ok)throw new Error('사이트가 본문 접근을 허용하지 않았사와요. 텍스트 입력을 이용해 주시와요.');
  const type=response.headers.get('content-type')||'';if(!/text\/html|text\/plain|application\/xhtml\+xml/i.test(type))throw new Error('HTML 또는 일반 텍스트 페이지만 지원한답니다.');
  let html=await readLimited(response);let text=html;
  if(!type.includes('text/plain')){
   html=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style|noscript|svg|iframe|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
   const novel=[...html.matchAll(/<(?:div|section)\b[^>]*class=["'][^"']*(?:js-novel-text|widget-episodeBody)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/gi)].map(m=>m[1]);
   const main=/<(?:article|main)\b[^>]*>([\s\S]*?)<\/(?:article|main)>/i.exec(html);
   text=(novel.length?novel.join('\n\n'):main?.[1]||html).replace(/<(nav|header|footer)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'').replace(/<rt\b[^>]*>[\s\S]*?<\/rt>/gi,'').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/(?:p|div|h[1-6]|li|section)>/gi,'\n\n').replace(/<[^>]+>/g,'').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,e:string)=>{if(e[0]==='#'){const n=e[1].toLowerCase()==='x'?parseInt(e.slice(2),16):parseInt(e.slice(1),10);return n>=0&&n<=0x10ffff?String.fromCodePoint(n):'';}return ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '} as Record<string,string>)[e.toLowerCase()]||'';});
  }
  text=text.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();if(text.length<30)throw new Error('추출 가능한 본문이 부족하와요. 텍스트 입력을 이용해 주시와요.');if(text.length>120000)throw new Error('본문이 12만 자를 초과했사와요. 나누어 붙여넣어 주시와요.');
  return Response.json({text},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return Response.json({error:e instanceof Error&&e.name==='TimeoutError'?'페이지 응답이 지연되었사와요. 본문 붙여넣기를 이용해 주시와요.':e instanceof Error?e.message:'본문을 불러오지 못했사와요.'},{status:400,headers:{'Cache-Control':'no-store'}})}
}
