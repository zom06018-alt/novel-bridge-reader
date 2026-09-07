export type ServiceAccount={type:string;project_id:string;client_email:string;private_key:string;private_key_id?:string};
export function parseServiceAccount(raw:string):ServiceAccount{
 let d;try{d=JSON.parse(raw)}catch{throw new Error('서비스 계정 JSON 형식을 확인해 주시와요.');}
 if(!d||d.type!=='service_account'||typeof d.project_id!=='string'||!d.project_id.match(/^[a-z][a-z0-9-]{4,62}$/)||typeof d.client_email!=='string'||!d.client_email.endsWith('.iam.gserviceaccount.com')||typeof d.private_key!=='string'||!d.private_key.includes('-----BEGIN PRIVATE KEY-----'))throw new Error('서비스 계정 JSON의 project_id, client_email, private_key가 필요하와요.');
 return d;
}
const base64url=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
export async function signAssertion(account:ServiceAccount){
 const encoder=new TextEncoder();const now=Math.floor(Date.now()/1000);
 const header=base64url(encoder.encode(JSON.stringify({alg:'RS256',typ:'JWT',...(account.private_key_id?{kid:account.private_key_id}:{})})));
 const claims=base64url(encoder.encode(JSON.stringify({iss:account.client_email,scope:'https://www.googleapis.com/auth/cloud-platform',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600})));
 const pem=account.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,'');
 let key:CryptoKey;try{key=await crypto.subtle.importKey('pkcs8',Uint8Array.from(atob(pem),c=>c.charCodeAt(0)),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign'])}catch{throw new Error('JSON의 비공개 키를 읽을 수 없사와요. 원본 키 파일 내용을 확인해 주시와요.');}
 const payload=header+'.'+claims;const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,encoder.encode(payload));return payload+'.'+base64url(new Uint8Array(signature));
}
export function vertexEndpoint(model:string,project?:string,location='global'){
 if(!/^[a-zA-Z0-9._-]+$/.test(model))throw new Error('모델 ID 형식을 확인해 주시와요.');
 if(!/^(global|[a-z]+(?:-[a-z]+)+[0-9])$/.test(location))throw new Error('리전 형식을 확인해 주시와요. 예: global, us-central1');
 if(project&&!/^[a-z][a-z0-9-]{4,62}$/.test(project))throw new Error('프로젝트 ID 형식을 확인해 주시와요.');
 const host=location==='global'?'aiplatform.googleapis.com':`${location}-aiplatform.googleapis.com`;
 return project?`https://${host}/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`:`https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent`;
}
