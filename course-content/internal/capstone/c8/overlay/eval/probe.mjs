export function probe() {
 const assertions = [], metrics = {}
 return { assertions, metrics,
  check(name, passed, expected, observed) { assertions.push({ name, passed:Boolean(passed), ...(expected === undefined ? {} : {expected,observed}) }) },
  count(name, value = 1) { metrics[name] = (metrics[name] ?? 0)+value },
  result() { return { assertions, metrics, status: assertions.length && assertions.every(a => a.passed) ? 'PASS' : 'FAIL' } },
 }
}
