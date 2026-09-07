const headers={'Cache-Control':'no-store','Pragma':'no-cache'};
export async function POST(req:Request){
 try{
  const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'동일한 사이트에서 요청해 주시와요.'},{status:403,headers});
  const raw=await req.text();if(raw.length>16000)return Response.json({error:'인증 요청이 너무 크사와요.'},{status:400,headers});
  const {assertion}=JSON.parse(raw);if(typeof assertion!=='string'||!/^[-\w]+\.[-\w]+\.[-\w]+$/.test(assertion))return Response.json({error:'인증 요청 형식이 올바르지 않사와요.'},{status:400,headers});
  const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),signal:AbortSignal.timeout(20000)});
  const data=await response.json() as {access_token?:string;expires_in?:number};
  if(!response.ok||!data.access_token)return Response.json({error:'Vertex 인증에 실패했사와요. 서비스 계정 활성 상태와 JSON 키를 확인해 주시와요.'},{status:401,headers});
  return Response.json({access_token:data.access_token,expires_in:data.expires_in||3600},{headers});
 }catch{return Response.json({error:'Vertex 인증 연결에 실패했사와요. 잠시 후 재시도해 주시와요.'},{status:400,headers});}
}
