const origin='https://a15600082570.github.io';
export default {async fetch(request,env){
 const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type','Cache-Control':'no-store','Content-Type':'application/json'};
 const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(request.headers.get('Origin')!==origin)return response({error:'Forbidden'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 const path=new URL(request.url).pathname;
 try{
 if(path==='/visit'&&request.method==='POST'){
 const ip=request.headers.get('CF-Connecting-IP');if(!ip)return response({error:'Missing client IP'},400);
 await env.DB.prepare('INSERT INTO visits (time, ip) VALUES (?, ?)').bind(new Date().toISOString(),ip).run();
 await env.DB.prepare("DELETE FROM visits WHERE time < ?").bind(new Date(Date.now()-30*86400000).toISOString()).run();
 return response({ok:true});
 }
 if(path==='/stats'&&request.method==='GET'){
 const token=request.headers.get('Authorization')||'';
 if(!env.ADMIN_TOKEN)return response({error:'Admin not configured'},503);
 const hash=async s=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
 const [a,b]=await Promise.all([hash(token),hash('Bearer '+env.ADMIN_TOKEN)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
 if(diff)return response({error:'Unauthorized'},401);
 const {results}=await env.DB.prepare('SELECT time, ip FROM visits WHERE time >= ? ORDER BY id DESC LIMIT 500').bind(new Date(Date.now()-30*86400000).toISOString()).all();
 return response({visits:results});
 }
 return response({error:'Not found'},404);
 }catch{return response({error:'Service unavailable'},503);}
}};
