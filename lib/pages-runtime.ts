export async function exchangePagesToken(assertion:string,signal:AbortSignal){
 let response:Response;
 try{response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),signal})}
 catch(e){if(signal.aborted)throw e;throw new Error('Google 인증 연결이 차단되었사와요. 브라우저·네트워크 설정을 확인하거나 Vertex Express 키를 이용해 주시와요.');}
 const data=await response.json();
 if(!response.ok||!data.access_token)throw new Error('Vertex 인증에 실패했사와요. 서비스 계정과 JSON 키를 확인해 주시와요.');
 return {access_token:data.access_token,expires_in:data.expires_in||3600};
}
export function extractPageText(html:string){
 const doc=new DOMParser().parseFromString(html,'text/html');
 doc.querySelectorAll('script,style,noscript,iframe,template,svg,nav,header,footer,rt,rp').forEach(el=>el.remove());
 const novel=Array.from(doc.querySelectorAll('.js-novel-text,.widget-episodeBody'));
 const roots=novel.length?novel:[doc.querySelector('article,main')||doc.body];
 const text=roots.map(root=>{root.querySelectorAll('br').forEach(el=>el.replaceWith('\n'));root.querySelectorAll('p,div,h1,h2,h3,h4,h5,h6,li,section').forEach(el=>el.append('\n\n'));return root.textContent||'';}).join('\n\n').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
 return text;
}
export async function loadPagesSource(value:string,signal:AbortSignal){
 let url:URL;try{url=new URL(value)}catch{throw new Error('올바른 HTTPS 주소를 입력해 주시와요.');}
 if(url.protocol!=='https:'||url.username||url.password)throw new Error('Pages에서는 HTTPS 주소만 불러올 수 있사와요.');
 let response:Response;
 try{response=await fetch(url.href,{signal,credentials:'omit',referrerPolicy:'no-referrer'})}catch(e){if(signal.aborted)throw e;throw new Error('이 사이트는 브라우저에서 본문을 불러올 수 없사와요. 원문을 복사한 뒤 텍스트 입력으로 번역해 주시와요.');}
 if(!response.ok)throw new Error('사이트가 접근을 허용하지 않았사와요. 텍스트 입력을 이용해 주시와요.');
 const type=response.headers.get('content-type')||'';
 if(!/text\/html|text\/plain|application\/xhtml\+xml/i.test(type))throw new Error('HTML 또는 일반 텍스트만 지원한답니다.');
 const reader=response.body?.getReader();if(!reader)throw new Error('본문을 읽을 수 없사와요.');const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2000000)throw new Error('본문 용량이 크므로 텍스트를 나누어 붙여넣어 주시와요.');chunks.push(value)}}finally{await reader.cancel()}
 const bytes=new Uint8Array(size);let pos=0;for(const c of chunks){bytes.set(c,pos);pos+=c.length;}
 const charset=/charset=["']?([^;\s"']+)/i.exec(type)?.[1]||/charset=["']?([^\s"'/>;]+)/i.exec(new TextDecoder().decode(bytes.slice(0,4096)))?.[1]||'utf-8';
 let html:string;try{html=new TextDecoder(charset).decode(bytes)}catch{html=new TextDecoder().decode(bytes)}
 const text=(type.includes('text/plain')?html:extractPageText(html)).trim();
 if(text.length<30)throw new Error('추출할 본문이 부족하와요. 텍스트 입력을 이용해 주시와요.');
 return text;
}
