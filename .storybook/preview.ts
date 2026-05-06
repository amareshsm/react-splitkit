import type { Preview } from '@storybook/react';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'app',
      values: [
        { name: 'app', value: '#f5f5f7' },
        { name: 'dark', value: '#0a0a0a' },
      ],
    },
  },
};

export default preview;
