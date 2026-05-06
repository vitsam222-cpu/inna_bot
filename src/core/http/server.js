import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../../config/env.js';
import { renderAdminPage } from '../../modules/admin/adminPage.js';
import { loadScenario, updateScenario } from '../../modules/scenario/scenarioService.js';
import { handleWebhook } from '../../modules/bot/botService.js';

function send(res, code, body, type='text/plain'){res.writeHead(code,{'content-type':type});res.end(body);}
async function parseJson(req){const chunks=[];for await (const c of req) chunks.push(c);return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');}
function auth(url){return url.searchParams.get('key')===env.adminKey;}

export function createServer(){
  return http.createServer(async (req,res)=>{
    const url = new URL(req.url, env.baseUrl);
    if(req.method==='GET' && url.pathname==='/health') return send(res,200,'ok');
    if(req.method==='GET' && url.pathname==='/webhook/max') return send(res,200,'MAX webhook endpoint is alive. Use POST requests from MAX here.');
    if(req.method==='GET' && url.pathname==='/admin') return send(res,200,renderAdminPage(env.adminKey),'text/html');
    if(req.method==='GET' && url.pathname==='/api/admin/scenario'){
      if(!auth(url)) return send(res,403,'forbidden');
      return send(res,200,JSON.stringify(loadScenario()),'application/json');
    }
    if(req.method==='POST' && url.pathname==='/api/admin/scenario'){
      if(!auth(url)) return send(res,403,'forbidden');
      try { const payload = await parseJson(req); const out=updateScenario(payload); return send(res,200,JSON.stringify(out),'application/json'); }
      catch(e){ return send(res,400,e.message); }
    }
    if(req.method==='POST' && url.pathname==='/webhook/max'){
      try {const payload=await parseJson(req); await handleWebhook(payload); return send(res,200,'ok');}
      catch(e){return send(res,500,e.message);}
    }
    if(req.method==='GET' && (url.pathname.startsWith('/js/')||url.pathname.startsWith('/css/')||url.pathname.startsWith('/uploads/'))){
      const full = path.join('src/public', url.pathname);
      if(!fs.existsSync(full)) return send(res,404,'not found');
      const ext = path.extname(full);
      const type = ext==='.js'?'text/javascript':ext==='.css'?'text/css':'application/octet-stream';
      return send(res,200,fs.readFileSync(full),type);
    }
    send(res,404,'not found');
  });
}
