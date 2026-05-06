import { describe, it, expect } from 'vitest';
import { createPanel, createSplit, isSplit, isPanel } from '../src/core/tree';
import { normalize } from '../src/core/normalize';

describe('normalize', () => {
  it('returns panels unchanged', () => {
    const p = createPanel('p1');
    expect(normalize(p)).toBe(p);
  });

  it('collapses a single-child split into its child', () => {
    const child = createPanel('p1');
    const root = createSplit('s1', 'horizontal', [child]);
    expect(normalize(root)).toBe(child);
  });

  it('flattens nested same-direction splits', () => {
    const inner = createSplit(
      's2',
      'horizontal',
      [createPanel('p2'), createPanel('p3')],
      [50, 50],
    );
    const root = createSplit(
      's1',
      'horizontal',
      [createPanel('p1'), inner],
      [50, 50],
    );
    const out = normalize(root);
    expect(out && isSplit(out)).toBe(true);
    if (out && isSplit(out)) {
      expect(out.children.map((c) => c.id)).toEqual(['p1', 'p2', 'p3']);
      // Inner share was 50; split into 25/25, plus p1 at 50 → [50, 25, 25].
      expect(out.sizes[0]).toBeCloseTo(50);
      expect(out.sizes[1]).toBeCloseTo(25);
      expect(out.sizes[2]).toBeCloseTo(25);
    }
  });

  it('does not flatten splits of different directions', () => {
    const inner = createSplit('s2', 'vertical', [createPanel('p2'), createPanel('p3')]);
    const root = createSplit('s1', 'horizontal', [createPanel('p1'), inner]);
    const out = normalize(root);
    expect(out && isSplit(out)).toBe(true);
    if (out && isSplit(out)) {
      expect(out.children).toHaveLength(2);
      expect(isSplit(out.children[1]!)).toBe(true);
    }
  });

  it('renormalizes sizes to sum to 100', () => {
    // Pretend a manually constructed tree had bad sizes.
    const root = createSplit(
      's1',
      'horizontal',
      [createPanel('p1'), createPanel('p2')],
      [10, 10],
    );
    const out = normalize(root);
    if (out && isSplit(out)) {
      const sum = out.sizes.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(100);
    }
  });

  it('recursively collapses nested single-child splits', () => {
    const leaf = createPanel('p1');
    const root = createSplit('s1', 'horizontal', [
      createSplit('s2', 'vertical', [createSplit('s3', 'horizontal', [leaf])]),
    ]);
    expect(normalize(root)).toBe(leaf);
  });

  it('returns null for an empty split', () => {
    const root = createSplit('s1', 'horizontal', []);
    expect(normalize(root)).toBeNull();
  });

  it('preserves panels regardless of empty tab lists', () => {
    const p = createPanel('p1', []);
    const out = normalize(p);
    expect(out && isPanel(out)).toBe(true);
  });
});
