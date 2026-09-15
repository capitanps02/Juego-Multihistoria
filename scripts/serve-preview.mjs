import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assets=new Map([['/','index.html'],['/index.html','index.html'],['/style.css','style.css'],['/app.js','app.js']]);
const port=Number(process.env.PREVIEW_PORT ?? 4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
await fs.access(path.join(root,'dist/session/game-session.js'));
const server=http.createServer(async(req,res)=>{
  try {
    if(req.method!=='GET' && req.method!=='HEAD'){res.writeHead(405);res.end();return;}
    const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    let file;
    if(pathname==='/' || pathname==='/index.html') file=path.join(root,'web/index.html');
    else if(pathname==='/classic') file=path.join(root,'preview/index.html');
    else if(pathname.startsWith('/web/')) {
      file=path.resolve(root,pathname.slice(1));
      if(!file.startsWith(path.join(root,'web')+path.sep) || !['.html','.css','.js','.json'].includes(path.extname(file))) file=null;
    }
    else if(assets.has(pathname)) file=path.join(root,'preview',assets.get(pathname));
    else if(pathname.startsWith('/dist/')) {
      file=path.resolve(root,pathname.slice(1));
      if(!file.startsWith(path.join(root,'dist')+path.sep) || !['.js','.json'].includes(path.extname(file))) file=null;
    }
    if(!file || !(await fs.stat(file)).isFile()){res.writeHead(404);res.end('No encontrado');return;}
    const content=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)],'Content-Length':content.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
      'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'"});
    res.end(req.method==='HEAD'?undefined:content);
  }catch{res.writeHead(404);res.end('No encontrado');}
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`El puerto ${port} está ocupado; no se ha sustituido el servidor existente.`:e);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Juego de prueba: http://127.0.0.1:${port}\nSolo accesible en este ordenador. Ctrl+C detiene el visor.`));
