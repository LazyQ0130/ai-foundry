"""Build the six Stage 3 V2 teaching diagrams as complete, editable SVGs."""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / 'public/course-media/stage-3'
ROOT.mkdir(parents=True, exist_ok=True)

def diagram(filename, title, subtitle, nodes, note=''):
    width, top, card_h, gap = 800, 150, 94, 38
    height = top + len(nodes) * (card_h + gap) + (110 if note else 35)
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-label="{escape(title)}">',
             '<defs><marker id="arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="12" markerHeight="12" orient="auto"><path d="M1 1 L11 6 L1 11" fill="none" stroke="#187A91" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>',
             f'<rect width="800" height="{height}" rx="28" fill="#F3F9F8"/>',
             f'<text x="400" y="60" text-anchor="middle" font-family="Arial,Microsoft YaHei,sans-serif" font-size="34" font-weight="700" fill="#15394B">{escape(title)}</text>',
             f'<text x="400" y="105" text-anchor="middle" font-family="Arial,Microsoft YaHei,sans-serif" font-size="22" fill="#477083">{escape(subtitle)}</text>']
    for i, (label, detail, kind) in enumerate(nodes):
        y = top + i * (card_h + gap)
        fill = {'blue':'#DDEDF5','teal':'#D9F4E9','amber':'#FFF0D7','red':'#FCE5E3'}[kind]
        edge = {'blue':'#2C739A','teal':'#138B79','amber':'#B47919','red':'#BC5A57'}[kind]
        parts.extend([f'<rect x="74" y="{y}" width="652" height="{card_h}" rx="22" fill="{fill}" stroke="{edge}" stroke-width="3"/>',
                      f'<circle cx="130" cy="{y+47}" r="29" fill="{edge}"/>',
                      f'<text x="130" y="{y+56}" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" font-weight="700" fill="white">{i+1}</text>',
                      f'<text x="185" y="{y+42}" font-family="Arial,Microsoft YaHei,sans-serif" font-size="29" font-weight="700" fill="#15394B">{escape(label)}</text>',
                      f'<text x="185" y="{y+74}" font-family="Arial,Microsoft YaHei,sans-serif" font-size="22" fill="#376477">{escape(detail)}</text>'])
        if i < len(nodes)-1:
            parts.append(f'<path d="M400 {y+card_h+6} V{y+card_h+gap-9}" fill="none" stroke="#187A91" stroke-width="4" marker-end="url(#arrow)"/>')
    if note:
        y = top + len(nodes) * (card_h + gap) - 14
        parts.extend([f'<rect x="74" y="{y}" width="652" height="76" rx="18" fill="#E7F1F4" stroke="#80B6C0" stroke-width="2"/>',
                      f'<text x="400" y="{y+48}" text-anchor="middle" font-family="Arial,Microsoft YaHei,sans-serif" font-size="24" font-weight="700" fill="#1D6577">{escape(note)}</text>'])
    parts.append('</svg>')
    (ROOT / filename).write_text('\n'.join(parts), encoding='utf-8')

diagram('s3-1-01.svg', '一次模型请求的安全边界', 'API Key 只留在自己的服务端', [
    ('Browser', '登录用户提交问题，不携带 Key', 'blue'),
    ('Next.js Server', '验证 Session 与输入；读取服务端 Key', 'teal'),
    ('Model Provider', '接收服务端请求，返回模型结果', 'blue'),
    ('Browser', '只收到经过整理的回答与用量', 'teal')])
diagram('s3-3-01.svg', '流式生成：取消与重新开始', '迟到的数据不能写入新回答', [
    ('请求 A', 'pending → streaming，逐段显示', 'blue'),
    ('停止 A', 'cancelled，保留已收到的文字', 'amber'),
    ('请求 B', '新的 generation id 开始生成', 'teal'),
    ('A 的迟到片段', '编号已过期：忽略；B 继续显示', 'red')])
diagram('s3-4-01.svg', '资料怎样进入向量库', '每块向量固定为 1024 维', [
    ('Document', '一篇非敏感资料', 'blue'),
    ('Chunk', '按规则切成有位置的文本块', 'teal'),
    ('Embedding', '同一模型生成每块向量', 'blue'),
    ('vector(1024)', '数据库检查实际维度', 'amber'),
    ('PostgreSQL + pgvector', '保存文档、分块和向量', 'teal')])
diagram('s3-5-01.svg', 'RAG 的单轮数据流', '先检索，再生成', [
    ('Question', '用户提出一个问题', 'blue'),
    ('Query Embedding', '用同一模型向量化问题', 'teal'),
    ('Top-K', '只检索当前用户 ready Chunk', 'blue'),
    ('Context', '把本次候选内容交给模型', 'teal'),
    ('Model → Answer', '根据 Context 生成简短回答', 'blue')], '检索命中不等于答案已被证实')
diagram('s3-6-01.svg', '引用的双层校验', '格式正确，还要属于本次检索集合', [
    ('Retrieved Chunks', '服务端得到当前用户的 Top-K', 'blue'),
    ('sourceId → Model JSON', '模型只能选择提供的 ID', 'teal'),
    ('Zod strict', '检查 JSON 字段、类型与长度', 'blue'),
    ('Allowed Set Membership', '逐个核对 ID 属于本次命中', 'amber'),
    ('Verified Source Cards', '从真实 Chunk 映射标题与预览', 'teal')])
diagram('s3-7-01.svg', '固定题集怎样帮助改进', '自动指标与人工支持度复核一起看', [
    ('Eval Set', '固定 8 道可答、4 道无答案', 'blue'),
    ('RAG', '顺序运行，每题只调用一次', 'teal'),
    ('自动指标', '检索、状态、引用、耗时与用量', 'blue'),
    ('人工 Support Review', '逐条看回答是否由来源支持', 'amber'),
    ('Error Categories', '按失败类型找到改进依据', 'teal')], '12/12 也只说明这份固定知识包的表现')
