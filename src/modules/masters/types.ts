import type { ReactNode } from "react";

export type MasterRecordValue = string | number | boolean | null | undefined | string[];
export type MasterRecord = Record<string, MasterRecordValue> & { id: string; status?: string };
export type MasterFieldType = "text" | "textarea" | "number" | "select" | "status" | "file" | "image" | "boolean";

export interface MasterFieldConfig {
  key: string;
  label: string;
  type?: MasterFieldType;
  required?: boolean;
  options?: string[] | ((recordsByMaster: Record<string, MasterRecord[]>) => string[]);
  uploadKind?: "image" | "file";
}

export interface MasterColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (record: MasterRecord) => ReactNode;
}

export interface MasterConfig {
  key: string;
  title: string;
  searchKeys: string[];
  fields: MasterFieldConfig[];
  columns: MasterColumnConfig[];
  initialRows: MasterRecord[];
  filters?: Array<{
    key: string;
    label: string;
    options: string[] | ((recordsByMaster: Record<string, MasterRecord[]>) => string[]);
  }>;
  fullPageCreatePath?: string;
}

export interface WizardFieldConfig {
  key: string;
  label: string;
  type?: MasterFieldType | "url" | "multifile";
  required?: boolean;
  uploadKind?: "image" | "file";
}

export interface WizardStepConfig {
  key: string;
  label: string;
  fields: WizardFieldConfig[];
}
