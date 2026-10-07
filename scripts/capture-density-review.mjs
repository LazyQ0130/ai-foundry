import { spawn } from 'node:child_process'
import { writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const output = resolve('docs/ux-density-review-2026-10-07')
await mkdir(output, { recursive: true })
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const port = 9237
const profile = join(tmpdir(), `aifoundry-density-${process.pid}`)
const child = spawn(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-proxy-server', '--no-first-run', '--remote-allow-origins=*', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })

async function waitFor(fn, timeout = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try { const value = await fn(); if (value) return value } catch { /* page still loading */ }
    await new Promise((done) => setTimeout(done, 150))
  }
  throw new Error('Timed out waiting for browser state')
}

try {
  await waitFor(async () => (await fetch(`http://127.0.0.1:${port}/json/version`)).ok)
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json()
  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((done, reject) => { socket.onopen = done; socket.onerror = reject })
  let id = 0
  const pending = new Map()
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    if (!message.id || !pending.has(message.id)) return
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    message.error ? reject(new Error(message.error.message)) : resolve(message.result)
  }
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const next = ++id
    pending.set(next, { resolve, reject })
    socket.send(JSON.stringify({ id: next, method, params }))
  })
  const evaluate = async (expression) => (await call('Runtime.evaluate', { expression, returnByValue: true })).result.value
  const capture = async (name, path, width, height, selector, modal = false) => {
    await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 })
    await call('Page.navigate', { url: `http://localhost:5173${path}` })
    await waitFor(async () => await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`))
    if (path === '/pricing') await waitFor(async () => await evaluate("document.querySelectorAll('button').length >= 6"))
    if (modal) {
      await evaluate("[...document.querySelectorAll('button')].find(x => x.textContent?.includes('选择项目版'))?.click()")
      await waitFor(async () => await evaluate("!!document.querySelector('[role=dialog] img')"))
    }
    const viewport = modal || name.startsWith('login-') || name.startsWith('register-')
    const pageHeight = viewport ? height : await evaluate('document.documentElement.scrollHeight')
    const result = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !viewport, fromSurface: true, clip: { x: 0, y: 0, width, height: pageHeight, scale: 1 } })
    await writeFile(join(output, name), Buffer.from(result.data, 'base64'))
    console.log(`${name}: ${width}×${pageHeight}`)
  }
  await call('Page.enable')
  await call('Runtime.enable')
  await capture('pricing-desktop.png', '/pricing', 1440, 900, 'h1')
  await capture('pricing-mobile.png', '/pricing', 390, 844, 'h1')
  await capture('login-desktop.png', '/login', 1440, 900, 'h2')
  await capture('login-mobile.png', '/login', 390, 844, 'h2')
  await capture('register-mobile.png', '/register', 390, 844, 'h2')
  await capture('purchase-modal-desktop.png', '/pricing', 1440, 820, 'h1', true)
  await capture('purchase-modal-mobile.png', '/pricing', 390, 844, 'h1', true)
  await capture('projects-desktop.png', '/projects', 1440, 900, '#project-lab-heading')
  await capture('capstone-desktop.png', '/capstone', 1440, 900, 'h1')
  socket.close()
} finally {
  child.kill()
}
