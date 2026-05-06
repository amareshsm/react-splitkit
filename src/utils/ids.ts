let counter = 0;

/**
 * Generates a stable, monotonically increasing id. Using a counter (not random)
 * keeps SSR output deterministic and tests reproducible. Consumers can override
 * via `LayoutProvider`'s `generateId` prop if they need cross-instance uniqueness.
 */
export const createId = (prefix: string = 'n'): string => {
  counter += 1;
  return `${prefix}_${counter}`;
};

export const resetIdCounter = (): void => {
  counter = 0;
};

export type IdGenerator = (prefix?: string) => string;
