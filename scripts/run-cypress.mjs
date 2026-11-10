// Cross-platform: start our local app, wait for readiness, run Cypress, clean up.
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const server=spawn(process.execPath,['scripts/dev.mjs','--port','4174'],{stdio:'inherit'});
let serverStopped=false;
server.on('exit',()=>{serverStopped=true;});
let runner;
function cleanup(){runner?.kill();server.kill();}
process.on('SIGINT',()=>{cleanup();process.exit(130);});
process.on('SIGTERM',()=>{cleanup();process.exit(143);});
try{
  const deadline=Date.now()+20000;
  let ready=false;
  while(Date.now()<deadline&&!serverStopped){
    try{const response=await fetch('http://127.0.0.1:4174/',{signal:AbortSignal.timeout(1000)});if(response.ok){ready=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,125));
  }
  if(!ready||serverStopped)throw Error('The local test server did not start on port 4174.');
  const args=process.argv.slice(2);
  const mode=args[0]==='--open'?'open':'run';
  if(mode==='open')args.shift();
  runner=spawn(process.execPath,[require.resolve('cypress/bin'),mode,...args],{stdio:'inherit'});
  const exitCode=await new Promise((resolve,reject)=>{runner.once('error',reject);runner.once('exit',code=>resolve(code??1));});
  process.exitCode=exitCode;
}catch(error){console.error(error.message);process.exitCode=1;}finally{cleanup();}
