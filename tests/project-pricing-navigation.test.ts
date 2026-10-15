import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import { projectPricingIntent, projectPricingPath } from '../src/lib/projectPricingNavigation.js'
import { authDestination, authPath } from '../src/lib/authNavigation.js'
import { ProjectPlanContext } from '../src/components/ProjectPlanContext.js'
import { FullPlanCard } from '../src/components/PlanCard.js'
import { planTemplates } from '../src/data/site.js'

const render = (child: ReturnType<typeof h>) => renderToStaticMarkup(h(StaticRouter, { location: '/' }, child))

test('every published workshop lesson reaches its required plan and keeps its return route', () => {
  for (let i = 1; i <= 9; i++) {
    const path = projectPricingPath(`c${i}`)
    const url = new URL(path, 'http://localhost')
    assert.equal(url.pathname, '/pricing')
    assert.equal(url.searchParams.get('plan'), 'all-access-projects')
    assert.equal(url.hash, '#plan-all-access-projects')
    const intent = projectPricingIntent(url.search)!
    assert.equal(intent.lesson?.id, `c${i}`)
    assert.equal(intent.returnTo, `/capstone/lessons/c${i}`)
    for (const mode of ['login', 'register'] as const) {
      const auth = new URL(authPath(mode, path), url)
      const returnedPricing = authDestination(auth.searchParams.get('next'), 'STUDENT')
      assert.equal(returnedPricing, path)
      assert.equal(projectPricingIntent(new URL(returnedPricing, url).search)?.returnTo, intent.returnTo)
    }
  }
})

test('generic workshop intent returns to overview; unsafe and unknown targets are never followed', () => {
  const generic = new URL(projectPricingPath(), 'http://localhost')
  assert.equal(projectPricingIntent(generic.search)?.returnTo, '/capstone')
  assert.equal(projectPricingIntent(''), null)
  assert.equal(projectPricingIntent('?plan=stage-1&next=/capstone/lessons/c2'), null)
  for (const next of ['https://example.com', '//example.com', '/admin/users', '/capstone/lessons/c99', '/capstone/lessons/c2?next=https://example.com']) {
    const intent = projectPricingIntent(`?plan=all-access-projects&next=${encodeURIComponent(next)}`)!
    assert.equal(intent.returnTo, '/capstone')
    assert.equal(intent.lesson, undefined)
  }
  assert.equal(projectPricingPath('c99'), projectPricingPath())
})

test('context explains the precise course and plan boundary and owners receive continuation instead of purchase', () => {
  const intent = projectPricingIntent(new URL(projectPricingPath('c2'), 'http://localhost').search)!
  const guest = render(h(ProjectPlanContext, { intent, access: false }))
  assert.match(guest, /C2 · 从需求到架构/)
  assert.match(guest, /单阶段和全阶段课程版均不含项目工坊/)
  assert.match(guest, /href="\/capstone\/lessons\/c2"/)
  const owner = render(h(ProjectPlanContext, { intent, access: true }))
  assert.match(owner, /无需重复开通/)
  assert.match(owner, /返回并继续学习/)
  const card = render(h(FullPlanCard, {
    plan: { ...planTemplates.find(plan => plan.id === 'all-access-projects')!, price: 699 }, onBuy: () => {},
    action: h('p', { role: 'status' }, '已开通项目工坊'),
  }))
  assert.match(card, /已开通项目工坊/)
  assert.doesNotMatch(card, /<button|选择项目版/)
})
