import type { ReactNode } from "react";
import type { UploadModule } from "../../services/api/upload";

export type MasterRecordValue = string | number | boolean | null | undefined | string[];
export type MasterRecord = Record<string, MasterRecordValue> & { id: string; status?: string };
export type MasterFieldType = "text" | "textarea" | "number" | "select" | "status" | "file" | "image" | "boolean";

/**
 * A select option that carries a real value (e.g. a parent record's numeric
 * id, stringified) separately from its display label (e.g. the parent
 * record's name). Introduced so cascading selects (City -> State, Area ->
 * City) can store the backend's real numeric parentId instead of matching on
 * a display-name string. Plain `string[]` options (used by every other
 * master type's options today) remain supported side-by-side — a plain
 * string is treated as both its own value and label. See
 * `normalizeMasterOptions` below.
 */
export interface MasterSelectOption {
  value: string;
  label: string;
}

export type MasterOptionsSource =
  | string[]
  | MasterSelectOption[]
  | ((recordsByMaster: Record<string, MasterRecord[]>) => string[] | MasterSelectOption[]);

export const normalizeMasterOptions = (raw: string[] | MasterSelectOption[]): MasterSelectOption[] =>
  raw.map((item) => (typeof item === "string" ? { value: item, label: item } : item));

export interface MasterFieldConfig {
  key: string;
  label: string;
  type?: MasterFieldType;
  required?: boolean;
  options?: MasterOptionsSource;
  uploadKind?: "image" | "file";
  /**
   * Required backend `module` value (see `src/services/api/upload.ts`) for
   * any field of type "file"/"image" — every upload call site must send this
   * or the backend rejects the request with a 422 (missing required
   * `module`). Set explicitly per master type in `masterConfigs.ts`; do not
   * rely on `MasterUploadField`'s fallback for new upload fields.
   */
  uploadModule?: UploadModule;
  /**
   * For "file"/"image" fields only: the record key that holds the currently
   * uploaded file's real, resolved URL (e.g. banner's `bannerImageUrl`,
   * mapped from the backend's `imageUrl`). When set, `MasterFormDialog`
   * passes that URL to `MasterUploadField` as `previewUrl` so edit mode can
   * show the current image before any new file is picked. Optional — fields
   * without a resolved URL available (property-type/amenity icons) simply
   * omit it and keep working as before.
   */
  previewUrlKey?: string;
}

export interface MasterColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (record: MasterRecord) => ReactNode;
}

/**
 * Optional async CRUD hooks for a master type that is wired to the real
 * backend (`/admin/masters/:type`) instead of the local `initialRows` mock
 * pattern. When present, `MasterManagementPage` fetches/mutates through
 * these instead of mutating `initialRows` in local React state. Absent (the
 * default) for every master type not yet migrated — those keep working
 * exactly as before. See `src/services/masterCrud.service.ts`.
 */
export interface MasterApiConfig {
  list: () => Promise<MasterRecord[]>;
  create: (formValues: MasterRecord) => Promise<MasterRecord>;
  update: (id: string, formValues: MasterRecord) => Promise<MasterRecord>;
  updateStatus: (id: string, status: string) => Promise<MasterRecord>;
  remove: (id: string) => Promise<void>;
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
    options: MasterOptionsSource;
  }>;
  fullPageCreatePath?: string;
  /**
   * When set, selecting this tab in `MasterManagementPage` does not render an
   * inline table at all — it immediately navigates to this route instead
   * (e.g. Banner's real, dedicated `/banners` page). Use this for a master
   * that has its own full CRUD page rather than the generic tab/table
   * pattern; `fields`/`columns`/`initialRows` are still required by the type
   * but are never rendered and can be left empty.
   */
  redirectPath?: string;
  /** When set, this master type is backend-live. See `MasterApiConfig` above. */
  api?: MasterApiConfig;
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
