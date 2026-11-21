/**
 * 错误文案兜底（零依赖）：
 * Node 网络层可能抛出 message 为空的错误——happy-eyeballs 双栈连接全部失败时，
 * 返回的 AggregateError 实测 name=AggregateError、code=ETIMEDOUT、message=""。
 * 直接 `${e.message}` 拼进模板会得到「失败原因：。」这种冒号后面空白的提示（#45）。
 * 这里统一产出一段非空原因：优先真实 message，其次内层 errors 的 message，
 * 再退到 name + code（如「AggregateError (ETIMEDOUT)」），并保证永远非空。
 */
export function describeError(e: unknown): string {
  const nested = e as { errors?: unknown[] } | null;
  const candidates: unknown[] = nested && Array.isArray(nested.errors) ? [e, ...nested.errors] : [e];
  for (const item of candidates) {
    const text = (item instanceof Error ? item.message : String(item)).trim();
    if (text) return text;
  }
  if (e instanceof Error) {
    const code = (e as NodeJS.ErrnoException).code;
    if (typeof code === 'string' && code.trim()) return `${e.name || 'Error'} (${code})`;
    return e.name || 'Error';
  }
  return '未知错误';
}
