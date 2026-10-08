import { deliverySmoke } from './delivery-smoke.mjs'
if(process.env.C9_PRODUCTION_SMOKE!=='1')throw Error('EXPLICIT_PRODUCTION_SMOKE_OPT_IN_REQUIRED')
try { await deliverySmoke({base:process.argv[2]}) }
catch { console.error('PRODUCTION_SMOKE_FAILED: inspect safe server event codes; no credentials printed');process.exitCode=1 }
