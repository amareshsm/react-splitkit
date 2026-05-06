import { describe, it, expect, beforeEach, vi } from 'vitest';
import { layoutReducer } from '../src/state/reducer';
import { createPanel, createSplit, findPanel, findNode } from '../src/core/tree';
import { isPanel, isSplit, LayoutNode, TabDescriptor } from '../src/core/types';
import { resetIdCounter } from '../src/utils/ids';

const tab = (id: string): TabDescriptor => ({ id, tabType: 't', title: id });

beforeEach(() => resetIdCounter());

describe('layoutReducer — split', () => {
  it('splits a panel to the right, creating a horizontal split', () => {
    const p = createPanel('p1', [tab('a')]);
    const out = layoutReducer(p, { type: 'SPLIT_PANEL', panelId: 'p1', target: 'right' });
    expect(isSplit(out)).toBe(true);
    if (isSplit(out)) {
      expect(out.direction).toBe('horizontal');
      expect(out.children[0]!.id).toBe('p1');
      expect(out.sizes).toEqual([50, 50]);
    }
  });

  it('splits to the left, placing the new panel before', () => {
    const p = createPanel('p1', [tab('a')]);
    const out = layoutReducer(p, { type: 'SPLIT_PANEL', panelId: 'p1', target: 'left' });
    if (isSplit(out)) {
      expect(out.children[1]!.id).toBe('p1');
      expect(isPanel(out.children[0]!)).toBe(true);
    }
  });

  it('splits a nested panel without flattening dissimilar directions', () => {
    const root = createSplit('s1', 'horizontal', [
      createPanel('p1', [tab('a')]),
      createPanel('p2', [tab('b')]),
    ]);
    const out = layoutReducer(root, { type: 'SPLIT_PANEL', panelId: 'p2', target: 'bottom' });
    // p2 should now be a vertical split.
    const found = findNode(out, 'p2');
    expect(found?.parent && isSplit(found.parent) && found.parent.direction === 'vertical').toBe(true);
  });

  it('flattens same-direction nested splits via normalize', () => {
    const root = createSplit('s1', 'horizontal', [
      createPanel('p1', [tab('a')]),
      createPanel('p2', [tab('b')]),
    ]);
    // Splitting p2 right creates a horizontal split inside a horizontal split → flattened.
    const out = layoutReducer(root, { type: 'SPLIT_PANEL', panelId: 'p2', target: 'right' });
    expect(isSplit(out)).toBe(true);
    if (isSplit(out)) {
      expect(out.direction).toBe('horizontal');
      expect(out.children).toHaveLength(3);
      expect(out.children.every(isPanel)).toBe(true);
    }
  });
});

describe('layoutReducer — tabs', () => {
  it('adds a tab to a panel', () => {
    const p = createPanel('p1', [tab('a')]);
    const out = layoutReducer(p, { type: 'ADD_TAB', panelId: 'p1', tab: tab('b') });
    if (isPanel(out)) {
      expect(out.tabs.map((t) => t.id)).toEqual(['a', 'b']);
      expect(out.activeTabId).toBe('a');
    }
  });

  it('activates the new tab when activate=true', () => {
    const p = createPanel('p1', [tab('a')]);
    const out = layoutReducer(p, {
      type: 'ADD_TAB',
      panelId: 'p1',
      tab: tab('b'),
      activate: true,
    });
    if (isPanel(out)) expect(out.activeTabId).toBe('b');
  });

  it('refuses to add a duplicate tab id', () => {
    const p = createPanel('p1', [tab('a')]);
    const out = layoutReducer(p, { type: 'ADD_TAB', panelId: 'p1', tab: tab('a') });
    expect(out).toBe(p);
  });

  it('removes a tab and activates a neighbor', () => {
    const p = createPanel('p1', [tab('a'), tab('b'), tab('c')]);
    const withActiveB: LayoutNode = { ...p, activeTabId: 'b' };
    const out = layoutReducer(withActiveB, { type: 'REMOVE_TAB', panelId: 'p1', tabId: 'b' });
    if (isPanel(out)) {
      expect(out.tabs.map((t) => t.id)).toEqual(['a', 'c']);
      expect(out.activeTabId).toBe('a');
    }
  });

  it('removes the panel when its last tab is closed (non-root)', () => {
    const root = createSplit('s1', 'horizontal', [
      createPanel('p1', [tab('a')]),
      createPanel('p2', [tab('b')]),
    ]);
    const out = layoutReducer(root, { type: 'REMOVE_TAB', panelId: 'p1', tabId: 'a' });
    // After removing the last tab in p1, the panel is removed and the split
    // collapses to its remaining child.
    expect(isPanel(out)).toBe(true);
    if (isPanel(out)) expect(out.id).toBe('p2');
  });

  it('keeps the root as an empty panel when its last tab is closed', () => {
    const p = createPanel('p1', [tab('a')]);
    const out = layoutReducer(p, { type: 'REMOVE_TAB', panelId: 'p1', tabId: 'a' });
    if (isPanel(out)) {
      expect(out.tabs).toEqual([]);
      expect(out.activeTabId).toBeNull();
    }
  });

  it('reorders tabs within a panel', () => {
    const p = createPanel('p1', [tab('a'), tab('b'), tab('c')]);
    const out = layoutReducer(p, {
      type: 'REORDER_TAB',
      panelId: 'p1',
      tabId: 'a',
      toIndex: 2,
    });
    if (isPanel(out)) expect(out.tabs.map((t) => t.id)).toEqual(['b', 'c', 'a']);
  });

  it('moves a tab between panels', () => {
    const root = createSplit('s1', 'horizontal', [
      createPanel('p1', [tab('a'), tab('b')]),
      createPanel('p2', [tab('c')]),
    ]);
    const out = layoutReducer(root, {
      type: 'MOVE_TAB',
      fromPanelId: 'p1',
      toPanelId: 'p2',
      tabId: 'b',
    });
    const p1 = findPanel(out, 'p1');
    const p2 = findPanel(out, 'p2');
    expect(p1?.node.tabs.map((t) => t.id)).toEqual(['a']);
    expect(p2?.node.tabs.map((t) => t.id)).toEqual(['c', 'b']);
    expect(p2?.node.activeTabId).toBe('b');
  });
});

describe('layoutReducer — resize / collapse / maximize', () => {
  it('resizes a split and renormalizes sizes', () => {
    const root = createSplit('s1', 'horizontal', [createPanel('p1'), createPanel('p2')]);
    const out = layoutReducer(root, { type: 'RESIZE_SPLIT', splitId: 's1', sizes: [30, 70] });
    if (isSplit(out)) expect(out.sizes).toEqual([30, 70]);
  });

  it('rejects resize when sizes length mismatches', () => {
    const root = createSplit('s1', 'horizontal', [createPanel('p1'), createPanel('p2')]);
    const out = layoutReducer(root, { type: 'RESIZE_SPLIT', splitId: 's1', sizes: [50] });
    expect(out).toBe(root);
  });

  it('toggles collapsed flag on a panel', () => {
    const p = createPanel('p1', [tab('a')]);
    const once = layoutReducer(p, { type: 'TOGGLE_COLLAPSE', panelId: 'p1' });
    if (isPanel(once)) expect(once.collapsed).toBe(true);
    const twice = layoutReducer(once, { type: 'TOGGLE_COLLAPSE', panelId: 'p1' });
    if (isPanel(twice)) expect(twice.collapsed).toBeUndefined();
  });

  it('maximizing a collapsed panel auto-expands it (mutually exclusive states)', () => {
    const collapsed = { ...createPanel('p1', [tab('a')]), collapsed: true } as const;
    const out = layoutReducer(collapsed, { type: 'TOGGLE_MAXIMIZE', panelId: 'p1' });
    if (isPanel(out)) {
      expect(out.maximized).toBe(true);
      expect(out.collapsed).toBeUndefined();
    }
  });

  it('collapsing a maximized panel clears the maximize flag', () => {
    const maxed = { ...createPanel('p1', [tab('a')]), maximized: true } as const;
    const out = layoutReducer(maxed, { type: 'TOGGLE_COLLAPSE', panelId: 'p1' });
    if (isPanel(out)) {
      expect(out.collapsed).toBe(true);
      expect(out.maximized).toBeUndefined();
    }
  });

  it('SPLIT_PANEL ignores actions whose newPanelId already exists (regression for Bug I)', () => {
    const root = createSplit('s1', 'horizontal', [
      createPanel('p1', [tab('a')]),
      createPanel('p2', [tab('b')]),
    ]);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const out = layoutReducer(root, {
      type: 'SPLIT_PANEL',
      panelId: 'p1',
      target: 'right',
      newPanelId: 'p2', // collides with existing panel
    });
    expect(out).toBe(root); // unchanged
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('SPLIT_PANEL ignores actions with duplicate newTabs ids (regression for Bug I)', () => {
    const root = createPanel('p1', [tab('a')]);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const out = layoutReducer(root, {
      type: 'SPLIT_PANEL',
      panelId: 'p1',
      target: 'right',
      newTabs: [tab('x'), tab('x')], // duplicate ids
    });
    expect(out).toBe(root);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('only allows one panel maximized at a time', () => {
    const root = createSplit('s1', 'horizontal', [
      createPanel('p1', [tab('a')]),
      createPanel('p2', [tab('b')]),
    ]);
    const a = layoutReducer(root, { type: 'TOGGLE_MAXIMIZE', panelId: 'p1' });
    const p1a = findPanel(a, 'p1');
    expect(p1a?.node.maximized).toBe(true);

    const b = layoutReducer(a, { type: 'TOGGLE_MAXIMIZE', panelId: 'p2' });
    const p1b = findPanel(b, 'p1');
    const p2b = findPanel(b, 'p2');
    expect(p1b?.node.maximized).toBeUndefined();
    expect(p2b?.node.maximized).toBe(true);
  });
});
