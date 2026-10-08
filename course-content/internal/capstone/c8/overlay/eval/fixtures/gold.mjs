export const CAPSTONE_EVAL_DATASET_VERSION = 'v1'
// Author-reviewed synthetic facts; changes require review and a dataset version bump.
export const documents = [
 { id: 'persistent', text: 'Persistent memory stores information across separate runs. Database-backed memory survives process restart. 持久记忆使用数据库，进程重启后仍然保留。' },
 { id: 'context', text: 'Short-term conversation memory only exists within the current execution context. The context window does not survive process restart. 短期上下文不会跨进程保留。' },
 { id: 'approval', text: 'Human approval must occur before a protected write is executed. Approval does not improve model reasoning speed. 受保护写入之前必须人工批准，批准不会提高推理速度。' },
 { id: 'retry', text: 'The fixture permits exactly 3 retries, not 30 retries. 固定实验只允许3次重试，不允许30次。' },
 { id: 'experiment', text: 'Model A was tested. The experiment did not show an improvement. Model B was not tested. 实验测试的是Model A，没有显示改善，未测试Model B。' },
 { id: 'transaction', text: 'PostgreSQL supports atomic transactions. This fixture makes no claim about database speed rankings. PostgreSQL支持原子事务，不提供数据库速度排名。' },
]
export const retrievalCases = [
 { id: 'persistent-keyword', query: 'Database-backed memory survives process restart', relevantCitationKeys: ['persistent'] },
 { id: 'persistent-paraphrase', query: 'durable memory retained between independent executions', relevantCitationKeys: ['persistent'] },
 { id: 'persistent-zh', query: '什么记忆能在进程重启后保留', relevantCitationKeys: ['persistent'] },
 { id: 'context-keyword', query: 'Short-term conversation context window', relevantCitationKeys: ['context'] },
 { id: 'context-zh', query: '短期上下文是否跨进程保留', relevantCitationKeys: ['context'] },
 { id: 'approval-paraphrase', query: 'human authorization before protected mutation', relevantCitationKeys: ['approval'] },
 { id: 'retry-number', query: 'exactly 3 retries', relevantCitationKeys: ['retry'] },
 { id: 'negation', query: 'experiment did not show an improvement', relevantCitationKeys: ['experiment'] },
 { id: 'entity', query: 'Model A tested Model B not tested', relevantCitationKeys: ['experiment'] },
 { id: 'transaction', query: 'PostgreSQL atomic transactions', relevantCitationKeys: ['transaction'] },
]
export const unsupportedQueries = ['What is the boiling point of titanium?', '火星地下海洋有多深？']
export const semanticGold = [
 { source: 'approval', supported: ['Human approval must occur before a protected write is executed.', '受保护写入之前需要人工批准。'], forbidden: ['Approval improves model reasoning speed.'] },
 { source: 'retry', supported: ['The fixture permits exactly 3 retries.', '固定实验只允许3次重试。'], forbidden: ['The fixture permits 30 retries.'] },
 { source: 'experiment', supported: ['Model A was tested.', 'The experiment did not show an improvement.'], forbidden: ['Model B was tested.', 'The experiment showed an improvement.'] },
 { source: 'transaction', supported: ['PostgreSQL supports atomic transactions.'], forbidden: ['PostgreSQL is the fastest database.'] },
]
export const realReportCases = [
 { id: 'report-persistence', query: 'Which memory survives process restart? Cite the provided evidence.', sources: ['persistent', 'context'], answerable: true },
 { id: 'report-negation-number', query: 'Which model was tested, did it improve, and how many retries are allowed?', sources: ['experiment', 'retry'], answerable: true },
 ...unsupportedQueries.map((query, i) => ({ id: `report-abstain-${i+1}`, query, sources: ['context'], answerable: false })),
]
