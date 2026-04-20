import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

// TODO: Sanity Project ID eintragen (nach sanity.io Registrierung)
// Den Project-ID auch in src/environments/environment.ts eintragen
const PROJECT_ID = 'u02qwa74'; // z.B. 'abc12345'
const DATASET = 'production';

export default defineConfig({
  name: 'vbc-ebikon',
  title: 'VBC Ebikon',
  basePath: '/sanity-studio',
  projectId: PROJECT_ID,
  dataset: DATASET,
  plugins: [
    structureTool(),
    visionTool({
      defaultApiVersion: '2024-01-01',
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
