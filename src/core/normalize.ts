import { LayoutNode, SplitNode, isPanel, isSplit } from './types';

/**
 * Reduces the tree to its minimal canonical form. Run after every mutation.
 *
 * Rules:
 *  1. A SplitNode with a single child is replaced by that child.
 *  2. A SplitNode whose direct child is a SplitNode of the same direction is
 *     flattened (the inner split's children are inlined, sizes recomputed
 *     proportionally so the affected slice keeps its overall share).
 *  3. A SplitNode with zero children returns null (caller handles removal).
 *  4. Empty PanelNodes (no tabs) are returned as-is here — removal of empty
 *     panels is the reducer's responsibility, since "empty" can be a transient
 *     valid state during multi-step ops.
 *  5. Sizes are renormalized to sum to 100.
 */
export const normalize = (root: LayoutNode | null): LayoutNode | null => {
  if (root === null) return null;
  if (isPanel(root)) return root;

  // Recurse first.
  const normalizedChildren: LayoutNode[] = [];
  for (const child of root.children) {
    const n = normalize(child);
    if (n !== null) normalizedChildren.push(n);
  }

  if (normalizedChildren.length === 0) return null;

  // Rebuild sizes to match (length-aligned with current children before flatten).
  const workingChildren = normalizedChildren;
  const workingSizes = alignSizes(root.sizes, root.children, normalizedChildren);

  // Flatten same-direction nested splits.
  const flatChildren: LayoutNode[] = [];
  const flatSizes: number[] = [];
  for (let i = 0; i < workingChildren.length; i++) {
    const child = workingChildren[i]!;
    const share = workingSizes[i] ?? 100 / workingChildren.length;
    if (isSplit(child) && child.direction === root.direction) {
      const innerTotal = child.sizes.reduce((a, b) => a + b, 0) || 1;
      for (let j = 0; j < child.children.length; j++) {
        flatChildren.push(child.children[j]!);
        flatSizes.push((child.sizes[j]! / innerTotal) * share);
      }
    } else {
      flatChildren.push(child);
      flatSizes.push(share);
    }
  }

  // Single-child collapse.
  if (flatChildren.length === 1) {
    return flatChildren[0]!;
  }

  return {
    ...root,
    children: flatChildren,
    sizes: renormalizeSizes(flatSizes),
  } satisfies SplitNode;
};

/**
 * If children were removed during recursion, sizes need to drop the same
 * indexes and renormalize. Match by referential identity of child nodes,
 * since `normalize` returns the same reference when nothing changed.
 */
const alignSizes = (
  sizes: number[],
  oldChildren: LayoutNode[],
  newChildren: LayoutNode[],
): number[] => {
  if (oldChildren.length === newChildren.length) {
    return [...sizes];
  }
  // Find which old indexes survived. A normalized child could differ by
  // identity even when its underlying panel id is unchanged, so match by id.
  const result: number[] = [];
  const survivorIds = new Set(newChildren.map((c) => c.id));
  // Build map of old id -> oldSize, flattening through any single-child collapses.
  for (let i = 0; i < oldChildren.length; i++) {
    if (survivorIds.has(oldChildren[i]!.id)) {
      result.push(sizes[i] ?? 0);
    }
  }
  // If lengths still don't match (because a normalized child changed id via
  // single-child-collapse), fall back to even distribution.
  if (result.length !== newChildren.length) {
    return newChildren.map(() => 100 / newChildren.length);
  }
  return renormalizeSizes(result);
};

const renormalizeSizes = (sizes: number[]): number[] => {
  const total = sizes.reduce((a, b) => a + b, 0);
  if (total === 0) return sizes.map(() => 100 / sizes.length);
  return sizes.map((s) => (s / total) * 100);
};
