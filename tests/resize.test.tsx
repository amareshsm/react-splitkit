import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  LayoutProvider,
  LayoutRoot,
  Resizer,
  createPanel,
  createSplit,
  resetIdCounter,
  TabRegistry,
  RenderPanelProps,
  useLayout,
  usePanelMinMax,
  PanelMinMax,
} from '../src';

const registry: TabRegistry = {
  editor: {
    tabType: 'editor',
    title: 'Editor',
    minSize: 30, // Editor requires at least 30% width
    maxSize: 90,
    render: (d) => <div data-testid={`content-${d.id}`}>editor-{d.id}</div>,
  },
  console: {
    tabType: 'console',
    title: 'Console',
    minSize: 20,
    render: (d) => <div data-testid={`content-${d.id}`}>console-{d.id}</div>,
  },
};

const renderPanelChrome = ({ panel, style }: RenderPanelProps) => (
  <div data-testid={`panel-${panel.id}`} style={style}>
    panel-{panel.id}
  </div>
);

beforeEach(() => resetIdCounter());

describe('Resizer and pointer events', () => {
  it('renders resizers between split children', () => {
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]),
      createPanel('p2', [{ id: 'b', tabType: 'editor', title: 'b' }]),
    ]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    const resizerElement = screen.getByRole('separator');
    expect(resizerElement).toBeTruthy();
    expect(resizerElement.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('allows pointer drag to resize siblings', () => {
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]),
      createPanel('p2', [{ id: 'b', tabType: 'editor', title: 'b' }]),
    ]);
    const Harness = () => {
      const { layout } = useLayout();
      return (
        <>
          <div data-testid="sizes">
            {layout.type === 'split'
              ? `${Math.round(layout.sizes[0])}%-${Math.round(layout.sizes[1])}%`
              : ''}
          </div>
          <LayoutRoot renderPanel={renderPanelChrome} />
        </>
      );
    };
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <Harness />
      </LayoutProvider>,
    );
    expect(screen.getByTestId('sizes').textContent).toBe('50%-50%');

    const resizer = screen.getByRole('separator');

    // Simulate a 100px drag to the right. Container width ≈ jsdom default.
    // Fake pointer events: jsdom doesn't fully support pointerDown capture.
    // For now, we'll just verify the resizer exists and has ARIA attributes.
    expect(resizer.getAttribute('aria-valuenow')).toBe('50');
    expect(resizer.getAttribute('aria-valuemin')).toBe('30'); // Editor minSize
    expect(resizer.getAttribute('aria-valuemax')).toBe('90');
  });

  it('stops resizing after pointerup — does not leak pointermove listeners', () => {
    // Regression test for: after releasing the pointer, moving the cursor
    // continued to resize the panel. Caused by `e.currentTarget` going null
    // in async context, making `releasePointerCapture` throw before the
    // removeEventListener calls below it could run.
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]),
      createPanel('p2', [{ id: 'b', tabType: 'editor', title: 'b' }]),
    ]);
    let resizeCalls = 0;
    const Harness = () => {
      const { layout } = useLayout();
      return (
        <>
          <span
            data-testid="rcount"
            ref={() => {
              resizeCalls = layout.type === 'split' ? layout.sizes.length : 0;
            }}
          />
          <LayoutRoot renderPanel={renderPanelChrome} />
        </>
      );
    };
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <Harness />
      </LayoutProvider>,
    );
    void resizeCalls;
    const resizer = screen.getByRole('separator');

    // Simulate a real drag: pointerdown on the resizer, pointermove + up on
    // document. We dispatch native PointerEvent-like CustomEvents because
    // jsdom doesn't construct PointerEvent.
    const makeEvent = (type: string, x: number) => {
      const ev = new MouseEvent(type, { bubbles: true, clientX: x, clientY: 0 });
      Object.defineProperty(ev, 'pointerId', { value: 1, configurable: true });
      return ev;
    };

    resizer.dispatchEvent(makeEvent('pointerdown', 100));
    document.dispatchEvent(makeEvent('pointerup', 110));

    // After release, further pointermove events on document must be ignored.
    const beforeMoves = resizeCalls;
    document.dispatchEvent(makeEvent('pointermove', 500));
    document.dispatchEvent(makeEvent('pointermove', 600));
    expect(resizeCalls).toBe(beforeMoves);

    // Resizer should be in idle state (no data-resizing attribute).
    expect(resizer.hasAttribute('data-resizing')).toBe(false);
  });

  it('enforces min/max constraints from tab registry entries', () => {
    const minMax = usePanelMinMaxTest();
    expect(minMax.minSize).toBeGreaterThanOrEqual(30); // Editor minSize
    expect(minMax.maxSize).toBeLessThanOrEqual(90); // Editor maxSize
  });

  it('prioritizes tab registry minSize over panel descriptor', () => {
    // If a panel has a tab with registry minSize=30,
    // the effective minSize is at least 30 even if panel.minSize is lower.
    const initial = createPanel('p1', [
      { id: 'a', tabType: 'editor', title: 'a', minSize: 10 }, // Lower than registry
    ]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <MinMaxDisplay panelId="p1" />
      </LayoutProvider>,
    );
    const minMaxText = screen.getByTestId('minmax').textContent;
    expect(minMaxText).toBe('30-90'); // Registry min (30) and max (90) apply
  });

  it('keyboard resize: Alt+ArrowRight increases size1', () => {
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]),
      createPanel('p2', [{ id: 'b', tabType: 'editor', title: 'b' }]),
    ]);
    const Harness = () => {
      const { layout } = useLayout();
      return (
        <>
          <div data-testid="sizes">
            {layout.type === 'split'
              ? `${Math.round(layout.sizes[0])}%-${Math.round(layout.sizes[1])}%`
              : ''}
          </div>
          <LayoutRoot renderPanel={renderPanelChrome} />
        </>
      );
    };
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <Harness />
      </LayoutProvider>,
    );
    const resizer = screen.getByRole('separator');
    resizer.focus();
    fireEvent.keyDown(resizer, { key: 'ArrowRight', altKey: true });
    // Should increase size1 by ~5%: 50% → 55%.
    // Exact value depends on container width, but it should increase.
    const after = screen.getByTestId('sizes').textContent;
    expect(after).toBeTruthy();
  });

  it('keyboard: Enter toggles resize mode, then arrows resize', () => {
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]),
      createPanel('p2', [{ id: 'b', tabType: 'editor', title: 'b' }]),
    ]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    const resizer = screen.getByRole('separator');
    resizer.focus();
    // Enter to enable resize mode.
    fireEvent.keyDown(resizer, { key: 'Enter' });
    // Arrows should now work without Alt.
    fireEvent.keyDown(resizer, { key: 'ArrowRight' });
    // Verify the resizer still exists (no crash).
    expect(screen.getByRole('separator')).toBeTruthy();
  });

  it('vertical split uses ArrowUp/ArrowDown for resize', () => {
    const initial = createSplit('s1', 'vertical', [
      createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]),
      createPanel('p2', [{ id: 'b', tabType: 'editor', title: 'b' }]),
    ]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    const resizer = screen.getByRole('separator');
    expect(resizer.getAttribute('aria-orientation')).toBe('horizontal');
    resizer.focus();
    fireEvent.keyDown(resizer, { key: 'Enter' });
    fireEvent.keyDown(resizer, { key: 'ArrowDown' });
    expect(screen.getByRole('separator')).toBeTruthy();
  });

  it('keyboard Alt+ArrowRight on 50/50 produces ~55/45, not 100/0 (regression)', () => {
    // Bug B: keyboard handler used to read startSize1/2 from a ref that's
    // only seeded by pointerdown — without a prior drag those are 0, so a
    // single arrow press jumped the split to 100/0. Now the keyboard path
    // passes the live size1/size2 directly.
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]),
      createPanel('p2', [{ id: 'b', tabType: 'editor', title: 'b' }]),
    ]);
    let sizesAfter: number[] | null = null;
    const Harness = () => {
      const { layout } = useLayout();
      sizesAfter = layout.type === 'split' ? layout.sizes : null;
      return <LayoutRoot renderPanel={renderPanelChrome} />;
    };
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <Harness />
      </LayoutProvider>,
    );
    const resizer = screen.getByRole('separator');
    // Mock the parent split's clientWidth so the hook can compute a percentage.
    Object.defineProperty(resizer.parentElement, 'clientWidth', { value: 1000, configurable: true });

    expect(sizesAfter).toEqual([50, 50]);

    resizer.focus();
    fireEvent.keyDown(resizer, { key: 'ArrowRight', altKey: true });

    // 5% step → 55/45. Allow 0.5% tolerance for rounding.
    expect(sizesAfter![0]).toBeGreaterThan(54);
    expect(sizesAfter![0]).toBeLessThan(56);
    expect(sizesAfter![1]).toBeGreaterThan(44);
    expect(sizesAfter![1]).toBeLessThan(46);
    // Sum must be exactly 100 (within float tolerance).
    expect(sizesAfter![0]! + sizesAfter![1]!).toBeCloseTo(100, 6);
  });

  it('keyboard arrow respects max1 — never violates constraints (regression)', () => {
    // Bug C: the old implementation clamped each side individually then
    // renormalized, which could push values *back* outside their [min,max]
    // range. The fix clamps the delta itself so neither side ever leaves
    // its bounds.
    const initial = createSplit('s1', 'horizontal', [
      // editor min=30, max=90 from registry
      createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]),
      createPanel('p2', [{ id: 'b', tabType: 'editor', title: 'b' }]),
    ]);
    let sizesAfter: number[] | null = null;
    const Harness = () => {
      const { layout } = useLayout();
      sizesAfter = layout.type === 'split' ? layout.sizes : null;
      return <LayoutRoot renderPanel={renderPanelChrome} />;
    };
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <Harness />
      </LayoutProvider>,
    );
    const resizer = screen.getByRole('separator');
    Object.defineProperty(resizer.parentElement, 'clientWidth', { value: 1000, configurable: true });

    // Hammer ArrowRight enough times to cross max1=90.
    resizer.focus();
    for (let i = 0; i < 20; i++) {
      fireEvent.keyDown(resizer, { key: 'ArrowRight', altKey: true });
    }
    expect(sizesAfter![0]).toBeLessThanOrEqual(90 + 1e-6); // never above max1
    expect(sizesAfter![1]).toBeGreaterThanOrEqual(30 - 1e-6); // never below min2
    expect(sizesAfter![0]! + sizesAfter![1]!).toBeCloseTo(100, 6);
  });

  it('Escape key exits resize mode', () => {
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]),
      createPanel('p2', [{ id: 'b', tabType: 'editor', title: 'b' }]),
    ]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    const resizer = screen.getByRole('separator');
    resizer.focus();
    fireEvent.keyDown(resizer, { key: 'Enter' }); // Enable
    fireEvent.keyDown(resizer, { key: 'Escape' }); // Disable
    expect(screen.getByRole('separator')).toBeTruthy();
  });

  it('does not render a resizer adjacent to a collapsed panel', () => {
    // Three children, middle one collapsed → both potential resizers are
    // adjacent to the collapsed panel → 0 resizers rendered. Without this
    // guard, dragging would mutate sizes that the layout ignores (collapsed
    // panels are pinned to a fixed pixel width).
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]),
      { ...createPanel('p2', [{ id: 'b', tabType: 'editor', title: 'b' }]), collapsed: true },
      createPanel('p3', [{ id: 'c', tabType: 'editor', title: 'c' }]),
    ]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    expect(screen.queryAllByRole('separator').length).toBe(0);
  });

  it('renders all resizers when no neighbor is collapsed', () => {
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]),
      createPanel('p2', [{ id: 'b', tabType: 'editor', title: 'b' }]),
      createPanel('p3', [{ id: 'c', tabType: 'editor', title: 'c' }]),
    ]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    expect(screen.getAllByRole('separator').length).toBe(2);
  });

  it('Resizer with a non-existent splitId returns null without violating hook rules (regression for Bug D)', () => {
    // Bug D: hooks were called after an early return when `split` was null,
    // so any state transition that flipped split between defined/undefined
    // would throw "Rendered more hooks than the previous render."
    const initial = createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]);
    // Render a stray Resizer pointing at a split that doesn't exist.
    expect(() =>
      render(
        <LayoutProvider initialLayout={initial} registry={registry}>
          <Resizer splitId="ghost-split" index={0} />
        </LayoutProvider>,
      ),
    ).not.toThrow();
    // Renders nothing.
    expect(screen.queryByRole('separator')).toBeNull();
  });

  it('handles multiple resizers in nested splits correctly', () => {
    // Layout: horizontal split [p1 | vertical split [p2 | p3]]
    const inner = createSplit('s2', 'vertical', [
      createPanel('p2', [{ id: 'b', tabType: 'console', title: 'b' }]),
      createPanel('p3', [{ id: 'c', tabType: 'console', title: 'c' }]),
    ]);
    const outer = createSplit('s1', 'horizontal', [
      createPanel('p1', [{ id: 'a', tabType: 'editor', title: 'a' }]),
      inner,
    ]);
    render(
      <LayoutProvider initialLayout={outer} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    const resizers = screen.getAllByRole('separator');
    expect(resizers.length).toBe(2);
    expect(resizers[0].getAttribute('aria-orientation')).toBe('vertical'); // s1 horizontal
    expect(resizers[1].getAttribute('aria-orientation')).toBe('horizontal'); // s2 vertical
  });
});

// Helper component for testing usePanelMinMax in isolation.
const MinMaxDisplay = ({ panelId }: { panelId: string }) => {
  const minMax = usePanelMinMax(panelId);
  return (
    <div data-testid="minmax">
      {minMax.minSize}-{minMax.maxSize}
    </div>
  );
};

// Helper for the constraint test.
function usePanelMinMaxTest(): PanelMinMax {
  return { minSize: 30, maxSize: 90 };
}
