import { functionalCases } from './cases-functional.mjs'
import { safetyCases } from './cases-safety.mjs'
import { reliabilityCases } from './cases-reliability.mjs'

export const cases = [...functionalCases, ...safetyCases, ...reliabilityCases]
if (cases.length !== 20 || new Set(cases.map(item => item.id)).size !== cases.length)
  throw new Error('Expected exactly 20 unique fixed Agent Eval cases')
for (const item of cases) {
  if (!item.id || !item.category || !item.title || !['deterministic', 'stub', 'database'].includes(item.mode) ||
      !Array.isArray(item.subcases) || !item.subcases.length || typeof item.execute !== 'function')
    throw new Error('Invalid Agent Eval case definition')
}
