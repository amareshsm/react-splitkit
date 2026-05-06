import type { Meta, StoryObj } from '@storybook/react';
import { LayoutProvider, LayoutRoot, createPanel, createSplit, type LayoutNode } from '../src';
import { demoRegistry, PanelChrome, StoryFrame } from './scaffold';

/* -------------------------------------------------------------------------- */
/* Layout presets                                                              */
/* -------------------------------------------------------------------------- */

const presets: Record<string, () => LayoutNode> = {
  'two-column': () =>
    createSplit('s1', 'horizontal', [
      createPanel('p1', [{ id: 't1', tabType: 'description', title: 'Description' }]),
      createPanel('p2', [{ id: 't2', tabType: 'console', title: 'Console' }]),
    ]),
  'three-row': () =>
    createSplit('s1', 'vertical', [
      createPanel('p1', [{ id: 't1', tabType: 'editor', title: 'index.tsx' }]),
      createPanel('p2', [{ id: 't2', tabType: 'editor', title: 'styles.css' }]),
      createPanel('p3', [{ id: 't3', tabType: 'console', title: 'Console' }]),
    ]),
  'ide-nested': () =>
    createSplit('root', 'horizontal', [
      createPanel('sidebar', [{ id: 'fs', tabType: 'files', title: 'Files' }]),
      createSplit('main', 'vertical', [
        createPanel('editor', [
          { id: 'e1', tabType: 'editor', title: 'index.tsx' },
          { id: 'e2', tabType: 'editor', title: 'styles.css' },
        ]),
        createPanel('bottom', [
          { id: 'c1', tabType: 'console', title: 'Console' },
          { id: 'p1', tabType: 'problems', title: 'Problems' },
        ]),
      ]),
    ]),
  'gfe-style': () =>
    createSplit('root', 'horizontal', [
      createPanel('desc', [
        { id: 'd1', tabType: 'description', title: 'Description' },
        { id: 'd2', tabType: 'solution', title: 'Solution' },
      ]),
      createSplit('right', 'vertical', [
        createPanel('code', [
          { id: 'f1', tabType: 'files', title: 'Files' },
          { id: 'e1', tabType: 'editor', title: 'index.tsx' },
          { id: 'e2', tabType: 'editor', title: 'styles.css' },
        ]),
        createPanel('preview', [
          { id: 'b1', tabType: 'browser', title: 'Browser' },
          { id: 'c1', tabType: 'console', title: 'Console' },
        ]),
      ]),
    ]),
  'many-tabs': () =>
    createPanel(
      'p',
      Array.from({ length: 12 }).map((_, i) => ({
        id: `t${i}`,
        tabType: 'editor' as const,
        title: `file-${i + 1}.tsx`,
      })),
    ),
};

/* -------------------------------------------------------------------------- */
/* Story args                                                                  */
/* -------------------------------------------------------------------------- */

interface StoryArgs {
  /** Pre-built layout shape rendered inside the story. */
  preset: keyof typeof presets;
  /** How a maximized panel is rendered (passed to LayoutRoot). */
  maximizeMode: 'overlay' | 'inline';
  /** Apply the GFE-style custom theme via CSS custom properties. */
  customTheme: boolean;
}

/**
 * Wrapper component so react-docgen-typescript generates a correct Props
 * table for the story args (rather than extracting LayoutRoot's internal
 * `renderPanel` function prop).
 */
const LayoutExample = ({ preset, maximizeMode, customTheme }: StoryArgs) => (
  <StoryFrame>
    {customTheme && (
      <style>{`
        .gfe-theme [data-splitkit-root] {
          --sk-bg: #ffffff;
          --sk-border: rgba(0, 0, 0, 0.08);
          --sk-tab-bg: #f9fafb;
          --sk-tab-bg-active: #ffffff;
          --sk-tab-fg: rgba(0, 0, 0, 0.45);
          --sk-tab-fg-active: #111111;
          --sk-accent: #6366f1;
          --sk-resizer-bg: rgba(0, 0, 0, 0.06);
          --sk-resizer-bg-hover: rgba(99, 102, 241, 0.15);
          --sk-resizer-bg-active: rgba(99, 102, 241, 0.35);
          --sk-radius: 6px;
        }
      `}</style>
    )}
    <div
      className={customTheme ? 'gfe-theme' : undefined}
      style={{ display: 'flex', width: '100%', height: '100%' }}
    >
      <LayoutProvider
        registry={demoRegistry}
        initialLayout={(presets[preset] ?? presets['two-column']!)()}
      >
        <LayoutRoot renderPanel={PanelChrome} maximizeMode={maximizeMode} />
      </LayoutProvider>
    </div>
  </StoryFrame>
);

/* -------------------------------------------------------------------------- */
/* Meta                                                                        */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof LayoutExample> = {
  title: 'Layout/Examples',
  component: LayoutExample,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    preset: {
      control: 'select',
      options: Object.keys(presets),
      description: 'Initial layout shape rendered by the story.',
      table: { category: 'Story' },
    },
    maximizeMode: {
      control: 'radio',
      options: ['overlay', 'inline'],
      description:
        '`overlay` — maximized panel covers the layout root. `inline` — the library ignores maximize; consumer handles it.',
      table: { category: 'LayoutRoot' },
    },
    customTheme: {
      control: 'boolean',
      description: 'Toggle a clean GFE-inspired theme via CSS custom properties.',
      table: { category: 'Theme' },
    },
  },
  args: {
    preset: 'two-column',
    maximizeMode: 'overlay',
    customTheme: false,
  },
};

export default meta;
type Story = StoryObj<typeof LayoutExample>;

/* -------------------------------------------------------------------------- */
/* Stories                                                                     */
/* -------------------------------------------------------------------------- */

export const TwoColumn: Story = { args: { preset: 'two-column' } };

export const ThreeRow: Story = { args: { preset: 'three-row' } };

export const NestedSplits: Story = {
  args: {
    preset: "two-column",
    customTheme: true,
    maximizeMode: "inline"
  },
  parameters: {
    docs: {
      description: {
        story: 'A classic 3-pane IDE shape: sidebar + (editor / console).',
      },
    },
  },
};

export const ManyTabs: Story = {
  args: { preset: 'many-tabs' },
  parameters: {
    docs: { description: { story: 'Exercises tablist horizontal scrolling.' } },
  },
};

/**
 * Mimics the GreatFrontend coding-platform layout: description / solution on
 * the left, file tree + editor in the centre, browser + console on the right.
 * Toggle `customTheme` off to compare against the default token set.
 */
export const GFEStyle: Story = {
  args: { preset: 'gfe-style', customTheme: true },
  parameters: {
    docs: {
      description: {
        story:
          'Three-column IDE layout styled to match a professional coding-platform UI. Toggle `customTheme` off to see the default theme.',
      },
    },
  },
};

export const InlineMaximize: Story = {
  args: { preset: 'ide-nested', maximizeMode: 'inline' },
  parameters: {
    docs: {
      description: {
        story:
          "When `maximizeMode='inline'`, LayoutRoot ignores maximized panels and the consumer can render their own overlay.",
      },
    },
  },
};
