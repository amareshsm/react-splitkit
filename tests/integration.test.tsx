import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import {
  LayoutProvider,
  LayoutRoot,
  TabList,
  TabPanel,
  TabAddMenu,
  createPanel,
  createSplit,
  resetIdCounter,
  TabRegistry,
  RenderPanelProps,
  TabDescriptor,
  useLayout,
  LayoutAction,
} from '../src';

const tab = (id: string, tabType = 'doc'): TabDescriptor => ({
  id,
  tabType,
  title: `T:${id}`,
});

const registry: TabRegistry = {
  doc: {
    tabType: 'doc',
    title: 'Doc',
    render: (d) => <div data-testid={`content-${d.id}`}>doc-{d.id}</div>,
    createDescriptor: () => ({ id: `doc-${Math.random().toString(36).slice(2, 7)}`, tabType: 'doc', title: 'Doc' }),
  },
  console: {
    tabType: 'console',
    title: 'Console',
    render: (d) => <div data-testid={`content-${d.id}`}>console-{d.id}</div>,
  },
};

const renderPanelChrome = ({ panel, style }: RenderPanelProps) => (
  <div data-testid={`panel-${panel.id}`} style={style}>
    <TabList
      panelId={panel.id}
      renderTab={({ tab, isActive, tabProps, label, closable, close }) => (
        <button
          {...tabProps}
          data-testid={`tab-${tab.id}`}
          data-active={isActive}
          style={{ fontWeight: isActive ? 'bold' : 'normal' }}
        >
          {label}
          {closable && (
            <span
              data-testid={`close-${tab.id}`}
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
            >
              x
            </span>
          )}
        </button>
      )}
      trailing={
        <TabAddMenu
          panelId={panel.id}
          render={(items) => (
            <div data-testid={`add-menu-${panel.id}`}>
              {items.map((it) => (
                <button
                  key={it.entry.tabType}
                  data-testid={`add-${panel.id}-${it.entry.tabType}`}
                  onClick={it.add}
                >
                  + {it.entry.title}
                </button>
              ))}
            </div>
          )}
        />
      }
    />
    <TabPanel panelId={panel.id} />
  </div>
);

beforeEach(() => resetIdCounter());

describe('LayoutProvider + LayoutRoot', () => {
  it('renders an initial single-panel layout', () => {
    const initial = createPanel('p1', [tab('a'), tab('b')]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    expect(screen.getByTestId('panel-p1')).toBeTruthy();
    expect(screen.getByTestId('tab-a')).toBeTruthy();
    expect(screen.getByTestId('tab-b')).toBeTruthy();
    // Active tab content visible.
    expect(screen.getByTestId('content-a')).toBeTruthy();
    expect(screen.queryByTestId('content-b')).toBeNull();
  });

  it('renders a horizontal split with two panels', () => {
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [tab('a')]),
      createPanel('p2', [tab('c', 'console')]),
    ]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    expect(screen.getByTestId('panel-p1')).toBeTruthy();
    expect(screen.getByTestId('panel-p2')).toBeTruthy();
  });

  it('switches active tab on click', () => {
    const initial = createPanel('p1', [tab('a'), tab('b')]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    fireEvent.click(screen.getByTestId('tab-b'));
    expect(screen.getByTestId('tab-b').getAttribute('data-active')).toBe('true');
    expect(screen.getByTestId('content-b')).toBeTruthy();
    expect(screen.queryByTestId('content-a')).toBeNull();
  });

  it('navigates tabs via keyboard arrows', () => {
    const initial = createPanel('p1', [tab('a'), tab('b'), tab('c')]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    const tabA = screen.getByTestId('tab-a');
    fireEvent.keyDown(tabA, { key: 'ArrowRight' });
    expect(screen.getByTestId('tab-b').getAttribute('data-active')).toBe('true');
    fireEvent.keyDown(screen.getByTestId('tab-b'), { key: 'End' });
    expect(screen.getByTestId('tab-c').getAttribute('data-active')).toBe('true');
  });

  it('closes tab when close affordance fires', () => {
    const initial = createPanel('p1', [tab('a'), tab('b')]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    fireEvent.click(screen.getByTestId('close-a'));
    expect(screen.queryByTestId('tab-a')).toBeNull();
    expect(screen.getByTestId('tab-b').getAttribute('data-active')).toBe('true');
  });

  it('adds a tab via the "+" menu', () => {
    const initial = createPanel('p1', [tab('a')]);
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <LayoutRoot renderPanel={renderPanelChrome} />
      </LayoutProvider>,
    );
    fireEvent.click(screen.getByTestId('add-p1-console'));
    // A tab with tabType=console should be added and activated.
    const newTab = screen.getAllByRole('tab').find((t) =>
      (t.textContent ?? '').toLowerCase().includes('console'),
    );
    expect(newTab).toBeTruthy();
    expect(newTab!.getAttribute('data-active')).toBe('true');
  });

  it('splits a panel via dispatch and renders the new panel', () => {
    const initial = createPanel('p1', [tab('a')]);
    const RootWithSplit = () => {
      const { dispatch } = useLayout();
      return (
        <>
          <button
            data-testid="split-right"
            onClick={() => dispatch({ type: 'SPLIT_PANEL', panelId: 'p1', target: 'right' })}
          />
          <LayoutRoot renderPanel={renderPanelChrome} />
        </>
      );
    };
    render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <RootWithSplit />
      </LayoutProvider>,
    );
    fireEvent.click(screen.getByTestId('split-right'));
    expect(screen.getByTestId('panel-p1')).toBeTruthy();
    // After split there should be exactly two panels rendered.
    const panels = screen.getAllByTestId(/^panel-/);
    expect(panels).toHaveLength(2);
  });

  it('renders only the maximized panel via overlay mode', () => {
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [tab('a')]),
      createPanel('p2', [tab('b')]),
    ]);
    const Harness = () => {
      const { dispatch } = useLayout();
      return (
        <>
          <button
            data-testid="max-p2"
            onClick={() => dispatch({ type: 'TOGGLE_MAXIMIZE', panelId: 'p2' })}
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
    // Pre-maximize: both panels in the underlying tree.
    expect(screen.getAllByTestId(/^panel-/).length).toBe(2);
    fireEvent.click(screen.getByTestId('max-p2'));
    // After maximize, the overlay duplicates p2; the tree underneath still
    // renders both (so unmaximize doesn't reset state). p2 appears twice.
    const p2s = screen.getAllByTestId('panel-p2');
    expect(p2s.length).toBe(2);
  });

  it('fires onChange after each successful action', () => {
    const initial = createPanel('p1', [tab('a')]);
    const calls: LayoutAction[] = [];
    const Harness = () => {
      const { dispatch } = useLayout();
      return (
        <button
          data-testid="add"
          onClick={() => dispatch({ type: 'ADD_TAB', panelId: 'p1', tab: tab('b') })}
        />
      );
    };
    render(
      <LayoutProvider
        initialLayout={initial}
        registry={registry}
        onChange={(_, action) => calls.push(action)}
      >
        <Harness />
      </LayoutProvider>,
    );
    fireEvent.click(screen.getByTestId('add'));
    expect(calls).toHaveLength(1);
    expect(calls[0]!.type).toBe('ADD_TAB');
  });

  it('onChange picks up swapped closures across renders (regression for stale-ref bug)', () => {
    const initial = createPanel('p1', [tab('a')]);
    const callsA: LayoutAction[] = [];
    const callsB: LayoutAction[] = [];

    let counter = 0;
    const Harness = () => {
      const { dispatch } = useLayout();
      return (
        <button
          data-testid="add"
          onClick={() =>
            dispatch({ type: 'ADD_TAB', panelId: 'p1', tab: tab(`x-${++counter}`) })
          }
        />
      );
    };

    const { rerender } = render(
      <LayoutProvider
        initialLayout={initial}
        registry={registry}
        onChange={(_, action) => callsA.push(action)}
      >
        <Harness />
      </LayoutProvider>,
    );
    fireEvent.click(screen.getByTestId('add'));
    expect(callsA).toHaveLength(1);
    expect(callsB).toHaveLength(0);

    // Swap the onChange closure. The store should call the NEW one, not the old.
    rerender(
      <LayoutProvider
        initialLayout={initial}
        registry={registry}
        onChange={(_, action) => callsB.push(action)}
      >
        <Harness />
      </LayoutProvider>,
    );
    fireEvent.click(screen.getByTestId('add'));
    expect(callsA).toHaveLength(1); // unchanged
    expect(callsB).toHaveLength(1);
  });

  it('marks the underlying tree aria-hidden + inert when a panel is maximized', () => {
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [tab('a')]),
      createPanel('p2', [tab('b')]),
    ]);
    const Harness = () => {
      const { dispatch } = useLayout();
      return (
        <>
          <button
            data-testid="max-p2"
            onClick={() => dispatch({ type: 'TOGGLE_MAXIMIZE', panelId: 'p2' })}
          />
          <LayoutRoot renderPanel={renderPanelChrome} />
        </>
      );
    };
    const { container } = render(
      <LayoutProvider initialLayout={initial} registry={registry}>
        <Harness />
      </LayoutProvider>,
    );
    const tree = container.querySelector('[data-splitkit-tree]') as HTMLElement;
    expect(tree).toBeTruthy();
    expect(tree.getAttribute('aria-hidden')).toBeNull();
    expect(tree.hasAttribute('inert')).toBe(false);

    fireEvent.click(screen.getByTestId('max-p2'));

    expect(tree.getAttribute('aria-hidden')).toBe('true');
    expect(tree.hasAttribute('inert')).toBe(true);

    // Restoring removes both attributes.
    fireEvent.click(screen.getByTestId('max-p2'));
    expect(tree.getAttribute('aria-hidden')).toBeNull();
    expect(tree.hasAttribute('inert')).toBe(false);
  });

  it('end-to-end: clicking Maximize in the scaffold actions menu opens the overlay', async () => {
    const { PanelChrome, demoRegistry } = await import('../stories/scaffold');
    const initial = createSplit('s1', 'horizontal', [
      createPanel('p1', [{ id: 't1', tabType: 'editor', title: 'a' }]),
      createPanel('p2', [{ id: 't2', tabType: 'editor', title: 'b' }]),
    ]);
    const { container } = render(
      <LayoutProvider initialLayout={initial} registry={demoRegistry}>
        <LayoutRoot renderPanel={PanelChrome} />
      </LayoutProvider>,
    );

    // Pre-maximize: no overlay.
    expect(container.querySelector('[data-splitkit-maximized-overlay]')).toBeNull();

    // Open the actions menu in panel p2 by clicking its trigger.
    // There are two "Panel actions" triggers (one per panel) — click the second.
    const triggers = screen.getAllByRole('button', { name: 'Panel actions' });
    expect(triggers.length).toBe(2);
    fireEvent.click(triggers[1]!);

    // The "Maximize" menu item should now exist in the open menu.
    const maximizeItems = screen.getAllByRole('menuitem', { name: /Maximize/i });
    expect(maximizeItems.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(maximizeItems[0]!);

    // Overlay should now exist with role="dialog".
    const overlay = container.querySelector('[data-splitkit-maximized-overlay]');
    expect(overlay).toBeTruthy();
    expect(overlay!.getAttribute('role')).toBe('dialog');

    // The underlying tree should be inert + aria-hidden.
    const tree = container.querySelector('[data-splitkit-tree]') as HTMLElement;
    expect(tree.getAttribute('aria-hidden')).toBe('true');
    expect(tree.hasAttribute('inert')).toBe(true);
  });

  it('end-to-end: split → + → pick chip — new panel survives (regression)', async () => {
    // Repro for: after splitting and converting the new panel's placeholder
    // tab via a chip, the new panel disappeared. Cause was sequencing —
    // remove-then-add briefly emptied the panel, which the reducer deletes,
    // and the subsequent add then no-ops because the panel is gone.
    const { PanelChrome, demoRegistry } = await import('../stories/scaffold');
    const initial = createPanel('p1', [{ id: 't1', tabType: 'editor', title: 'a' }]);
    const { container } = render(
      <LayoutProvider initialLayout={initial} registry={demoRegistry}>
        <LayoutRoot renderPanel={PanelChrome} />
      </LayoutProvider>,
    );

    // Open the actions menu and pick "Split right".
    fireEvent.click(screen.getByRole('button', { name: 'Panel actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Split right/i }));

    // Two panels now; two "+" buttons. Click the second (the new empty panel).
    const plusButtons = screen.getAllByRole('button', { name: 'New tab' });
    expect(plusButtons.length).toBe(2);
    fireEvent.click(plusButtons[1]!);

    // Pick "Console" in the chooser.
    fireEvent.click(screen.getByRole('button', { name: 'Console' }));

    // Both panels must still be present — the split should not have collapsed.
    expect(container.querySelectorAll('[data-splitkit-cell]').length).toBe(2);
    // The chosen content rendered.
    expect(screen.getByText('$ npm run dev')).toBeTruthy();
  });

  it('end-to-end: + button adds a "New tab" placeholder; chip selects a kind', async () => {
    const { PanelChrome, demoRegistry } = await import('../stories/scaffold');
    const initial = createPanel('p1', [{ id: 't1', tabType: 'editor', title: 'a' }]);
    render(
      <LayoutProvider initialLayout={initial} registry={demoRegistry}>
        <LayoutRoot renderPanel={PanelChrome} />
      </LayoutProvider>,
    );

    // Click "+" — should add a placeholder tab and activate it.
    fireEvent.click(screen.getByRole('button', { name: 'New tab' }));
    expect(screen.getByText('Tabs')).toBeTruthy(); // chooser header inside placeholder

    // Pick "Console" — placeholder is replaced.
    fireEvent.click(screen.getByRole('button', { name: 'Console' }));

    // The chooser is gone; the console content rendered.
    expect(screen.queryByText('Tabs')).toBeNull();
    expect(screen.getByText('$ npm run dev')).toBeTruthy();
  });

  it('a registry render that uses hooks survives tab switches (regression for Bug E)', () => {
    // If TabPanel called entry.render directly, hooks inside the consumer's
    // render would attach to TabPanel and changing active tab (different
    // render output / hook count) would throw "Rendered more hooks than
    // during the previous render". The wrapper component scopes them.
    const HookyTab = () => {
      // A real hook call — this is the part that used to break.
      const [, setX] = useState(0);
      void setX;
      return <div data-testid="hooky">hooky</div>;
    };
    const reg: TabRegistry = {
      doc: {
        tabType: 'doc',
        title: 'Doc',
        render: (d) => <div data-testid={`content-${d.id}`}>doc-{d.id}</div>,
      },
      hooky: {
        tabType: 'hooky',
        title: 'Hooky',
        render: () => <HookyTab />,
      },
    };
    const initial = createPanel('p1', [tab('a', 'doc'), tab('b', 'hooky')]);
    render(
      <LayoutProvider initialLayout={initial} registry={reg}>
        <LayoutRoot
          renderPanel={({ panel, style }) => (
            <div data-testid={`panel-${panel.id}`} style={style}>
              <TabList
                panelId={panel.id}
                renderTab={({ tab, tabProps }) => (
                  <button {...tabProps} data-testid={`tab-${tab.id}`}>
                    {tab.title}
                  </button>
                )}
              />
              <TabPanel panelId={panel.id} />
            </div>
          )}
        />
      </LayoutProvider>,
    );
    // Start on doc.
    expect(screen.getByTestId('content-a')).toBeTruthy();
    // Switch to the hooky tab — this used to crash with the rules-of-hooks error.
    expect(() => fireEvent.click(screen.getByTestId('tab-b'))).not.toThrow();
    expect(screen.getByTestId('hooky')).toBeTruthy();
    // Switch back. Round-trip without errors.
    expect(() => fireEvent.click(screen.getByTestId('tab-a'))).not.toThrow();
    expect(screen.getByTestId('content-a')).toBeTruthy();
  });

  it('two providers with identical panel/tab ids produce unique DOM ids (regression for Bug F)', () => {
    // Without per-provider id prefixing, both providers would emit
    // id="sk-tab-p1-x" and break aria-controls/aria-labelledby linkage.
    const layout = createPanel('p1', [tab('x')]);
    const { container } = render(
      <>
        <LayoutProvider initialLayout={layout} registry={registry}>
          <LayoutRoot renderPanel={renderPanelChrome} />
        </LayoutProvider>
        <LayoutProvider initialLayout={layout} registry={registry}>
          <LayoutRoot renderPanel={renderPanelChrome} />
        </LayoutProvider>
      </>,
    );

    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(2);
    const ids = Array.from(tabs).map((t) => t.id);
    expect(new Set(ids).size).toBe(2); // no duplicates

    const tabpanels = container.querySelectorAll('[role="tabpanel"]');
    expect(tabpanels.length).toBe(2);
    expect(new Set(Array.from(tabpanels).map((p) => p.id)).size).toBe(2);

    // Each tab's aria-controls must resolve to exactly one element.
    for (const t of Array.from(tabs)) {
      const controls = t.getAttribute('aria-controls')!;
      expect(document.getElementById(controls)).not.toBeNull();
    }
  });

  it('supports two independent layouts on the same page', () => {
    const a = createPanel('a1', [tab('x')]);
    const b = createPanel('b1', [tab('y')]);
    render(
      <>
        <LayoutProvider initialLayout={a} registry={registry}>
          <LayoutRoot renderPanel={renderPanelChrome} />
        </LayoutProvider>
        <LayoutProvider initialLayout={b} registry={registry}>
          <LayoutRoot renderPanel={renderPanelChrome} />
        </LayoutProvider>
      </>,
    );
    // Closing x in the first layout shouldn't affect the second.
    fireEvent.click(screen.getByTestId('close-x'));
    expect(screen.queryByTestId('tab-x')).toBeNull();
    expect(screen.getByTestId('tab-y')).toBeTruthy();
  });
});
