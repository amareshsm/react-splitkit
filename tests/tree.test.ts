import { describe, it, expect } from 'vitest';
import {
  createPanel,
  createSplit,
  findNode,
  findPanel,
  findTab,
  replaceNode,
} from '../src/core/tree';
import { TabDescriptor } from '../src/core/types';

const tab = (id: string): TabDescriptor => ({ id, tabType: 't', title: id });

describe('tree primitives', () => {
  it('finds a panel by id at the root', () => {
    const p = createPanel('p1', [tab('a')]);
    const found = findPanel(p, 'p1');
    expect(found?.node.id).toBe('p1');
    expect(found?.parent).toBeNull();
  });

  it('finds a nested panel and reports its parent', () => {
    const p1 = createPanel('p1');
    const p2 = createPanel('p2');
    const root = createSplit('s1', 'horizontal', [p1, p2]);
    const found = findPanel(root, 'p2');
    expect(found?.node.id).toBe('p2');
    expect(found?.parent?.id).toBe('s1');
    expect(found?.indexInParent).toBe(1);
  });

  it('locates a tab inside a deeply nested panel', () => {
    const inner = createPanel('p2', [tab('x'), tab('y')]);
    const root = createSplit('s1', 'horizontal', [
      createPanel('p1'),
      createSplit('s2', 'vertical', [inner, createPanel('p3')]),
    ]);
    const found = findTab(root, 'y');
    expect(found?.panel.id).toBe('p2');
    expect(found?.tabIndex).toBe(1);
  });

  it('returns null when looking up a missing id', () => {
    const root = createSplit('s1', 'horizontal', [createPanel('p1'), createPanel('p2')]);
    expect(findNode(root, 'nope')).toBeNull();
  });

  it('replaces a node and preserves sibling sizes', () => {
    const root = createSplit(
      's1',
      'horizontal',
      [createPanel('p1'), createPanel('p2'), createPanel('p3')],
      [25, 25, 50],
    );
    const replaced = replaceNode(root, 'p2', createPanel('pNew')) as typeof root;
    expect(replaced.children.map((c) => c.id)).toEqual(['p1', 'pNew', 'p3']);
    expect(replaced.sizes).toEqual([25, 25, 50]);
  });

  it('removes a node and redistributes its size proportionally', () => {
    const root = createSplit(
      's1',
      'horizontal',
      [createPanel('p1'), createPanel('p2'), createPanel('p3')],
      [25, 25, 50],
    );
    const removed = replaceNode(root, 'p2', null) as typeof root;
    expect(removed.children.map((c) => c.id)).toEqual(['p1', 'p3']);
    // 25 and 50 → renormalized to sum 100
    const total = removed.sizes.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(100);
    // p1 should be 1/3 share; p3 should be 2/3.
    expect(removed.sizes[0]).toBeCloseTo(100 / 3);
    expect(removed.sizes[1]).toBeCloseTo(200 / 3);
  });

  it('returns null when removing the only remaining child', () => {
    const root = createSplit('s1', 'horizontal', [createPanel('p1')]);
    expect(replaceNode(root, 'p1', null)).toBeNull();
  });
});
