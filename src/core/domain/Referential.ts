import { Criterion } from './Criterion';

export interface Referential {
  id: string;
  name: string;
  version: string;
  description: string;
  lastUpdate: string;
  source: string;
  criteria: Criterion[];
  themes: {
    id: string;
    name: string;
    description: string;
  }[];
}
