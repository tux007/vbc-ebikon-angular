import { defineCliConfig } from 'sanity/cli';

const PROJECT_ID = 'u02qwa74';
const DATASET = 'production';

export default defineCliConfig({
  api: {
    projectId: PROJECT_ID,
    dataset: DATASET,
  },
});
