/**
 * Schema category metadata
 */
export interface CategoryMetadata {
  name: string;
  label: string;
  description: string;
  tags: string[];
  icon?: string;
  order?: number;
}
