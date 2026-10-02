import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { createHash } from 'node:crypto'
import { canonicalArgs } from './approval.mjs'

test('isolated in-memory SQL idempotency spike: repeated resume creates one note', () => {
  const db = new DatabaseSync(':memory:')
  try {
    db.exec(`CREATE TABLE AgentAction (id TEXT PRIMARY KEY, runId TEXT NOT NULL, stepId TEXT NOT NULL,
      toolName TEXT NOT NULL, canonicalArgs TEXT NOT NULL, status TEXT NOT NULL, idempotencyKey TEXT UNIQUE NOT NULL);
      CREATE TABLE ResearchNote (id TEXT PRIMARY KEY, ownerId TEXT NOT NULL, title TEXT NOT NULL,
      content TEXT NOT NULL, actionKey TEXT UNIQUE NOT NULL);`)
    const args = canonicalArgs({ title: 'RAG', content: 'Research note' })
    const key = createHash('sha256').update(JSON.stringify(['run-1', 'step-1', 'save_research_note', args])).digest('hex')
    function resume() {
      db.exec('BEGIN IMMEDIATE')
      try {
        db.prepare(`INSERT INTO AgentAction VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(idempotencyKey) DO NOTHING`)
          .run('action-1', 'run-1', 'step-1', 'save_research_note', args, 'approved', key)
        db.prepare(`INSERT INTO ResearchNote VALUES (?, ?, ?, ?, ?) ON CONFLICT(actionKey) DO NOTHING`)
          .run('note-1', 'alice', 'RAG', 'Research note', key)
        db.prepare(`UPDATE AgentAction SET status = 'executed' WHERE idempotencyKey = ?`).run(key)
        db.exec('COMMIT')
      } catch (error) { db.exec('ROLLBACK'); throw error }
    }
    resume(); resume()
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM ResearchNote').get().count, 1)
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM AgentAction').get().count, 1)
  } finally { db.close() }
})
