import { describe, it, expect, vi } from 'vitest';
import { withRateLimit } from './rateLimit';

describe('withRateLimit', () => {
  it('calls the provided function and returns its result', async () => {
    const fn = vi.fn().mockResolvedValue('result');
    const value = await withRateLimit('key', 'id', fn);
    expect(fn).toHaveBeenCalledOnce();
    expect(value).toBe('result');
  });

  it('propagates errors thrown by the function', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(withRateLimit('key', 'id', fn)).rejects.toThrow('boom');
  });
});
