import { deliverySmoke } from './delivery-smoke.mjs'
if(process.env.C9_STAGING_SMOKE!=='1')throw Error('EXPLICIT_STAGING_SMOKE_OPT_IN_REQUIRED')
try { await deliverySmoke({base:process.argv[2],staging:true,local:process.env.C9_LOCAL_STAGING_SMOKE==='1'}) }
catch { console.error('STAGING_SMOKE_FAILED: inspect safe event codes; no credentials printed');process.exitCode=1 }
