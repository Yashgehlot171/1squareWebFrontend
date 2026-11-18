import { masterCrudService, type MasterApiItem } from "../../../services/masterCrud.service";
import type { MasterApiConfig, MasterConfig, MasterRecord } from "../types";

const now = "2026-07-19";

const withBase = (id: string, status = "Active") => ({ id, status, createdDate: now });

// --- Live-backed State / City / Area masters -------------------------------
// Wired against 1SqrPropertyBackend's `/admin/masters/states|cities|areas`
// (adminMasterRouter, src/routes/master.routes.ts), verified live on
// 2026-09-17 (see masterCrud.service.ts for the exact request/response
// evidence, including the confirmed-broken plain PATCH .../:id endpoint).
// Response item shape (identical for all three, from `present()` in
// 1SqrPropertyBackend/src/services/master.service.ts):
//   { id: number, type: string, name: string, code: string,
//     description: string | null, parentId: number | null, sortOrder: number,
//     status: "active" | "inactive", metadata: object, createdAt, updatedAt }
// City's parentId is the numeric stateId; Area's parentId is the numeric
// cityId (src/config/master.config.ts parentKey: "stateId"/"cityId") — real
// foreign keys, not name strings. The admin UI still needs a human-readable
// label for the cascading dropdown/column/search/filter, so each fetched
// city/area MasterRecord carries BOTH: `stateId`/`cityId` (the real numeric
// FK, stringified, bound to the form's select field and sent as `parentId`
// on save) and `state`/`city` (the resolved display name, used for the
// table column, search and filter exactly like the old mock's name-string
// fields did).

const toDisplayStatus = (status: "active" | "inactive"): string => (status === "active" ? "Active" : "Inactive");
const toApiStatus = (status?: string): "active" | "inactive" => (status === "Inactive" ? "inactive" : "active");
const toDateOnly = (iso: string) => (iso ? iso.slice(0, 10) : "");
const fieldToText = (value: MasterRecord[string]) => (value === null || value === undefined ? "" : String(value)).trim();

const stateItemToRecord = (item: MasterApiItem): MasterRecord => ({
  id: String(item.id),
  stateName: item.name,
  stateCode: item.code,
  status: toDisplayStatus(item.status),
  createdDate: toDateOnly(item.createdAt),
});

const stateApi: MasterApiConfig = {
  async list() {
    const items = await masterCrudService.list("states");
    return items.map(stateItemToRecord);
  },
  async create(formValues) {
    const name = fieldToText(formValues.stateName);
    const code = fieldToText(formValues.stateCode);
    const item = await masterCrudService.create("states", { name, code, status: toApiStatus(String(formValues.status ?? "Active")) });
    return stateItemToRecord(item);
  },
  async update(id, formValues) {
    const item = await masterCrudService.update("states", id, { name: fieldToText(formValues.stateName), code: fieldToText(formValues.stateCode) });
    return stateItemToRecord(item);
  },
  async updateStatus(id, status) {
    const item = await masterCrudService.updateStatus("states", id, toApiStatus(status));
    return stateItemToRecord(item);
  },
  async remove(id) {
    await masterCrudService.remove("states", id);
  },
};

const buildIdNameMap = async (type: string): Promise<Map<number, string>> => {
  const items = await masterCrudService.list(type);
  return new Map(items.map((item) => [item.id, item.name]));
};

const cityItemToRecord = (item: MasterApiItem, statesById: Map<number, string>): MasterRecord => ({
  id: String(item.id),
  cityName: item.name,
  stateId: item.parentId != null ? String(item.parentId) : "",
  state: item.parentId != null ? statesById.get(item.parentId) ?? "" : "",
  status: toDisplayStatus(item.status),
  createdDate: toDateOnly(item.createdAt),
});

const cityApi: MasterApiConfig = {
  async list() {
    const [items, statesById] = await Promise.all([masterCrudService.list("cities"), buildIdNameMap("states")]);
    return items.map((item) => cityItemToRecord(item, statesById));
  },
  async create(formValues) {
    const name = fieldToText(formValues.cityName);
    const parentId = Number(formValues.stateId);
    // `code` is required by the request schema but ignored server-side for
    // city (it de-duplicates on `name` instead) — see MasterMutationInput.code.
    const item = await masterCrudService.create("cities", { name, code: name, parentId, status: toApiStatus(String(formValues.status ?? "Active")) });
    const statesById = await buildIdNameMap("states");
    return cityItemToRecord(item, statesById);
  },
  async update(id, formValues) {
    const name = fieldToText(formValues.cityName);
    const parentId = formValues.stateId ? Number(formValues.stateId) : undefined;
    const item = await masterCrudService.update("cities", id, { name, code: name, parentId });
    const statesById = await buildIdNameMap("states");
    return cityItemToRecord(item, statesById);
  },
  async updateStatus(id, status) {
    const item = await masterCrudService.updateStatus("cities", id, toApiStatus(status));
    const statesById = await buildIdNameMap("states");
    return cityItemToRecord(item, statesById);
  },
  async remove(id) {
    await masterCrudService.remove("cities", id);
  },
};

const areaItemToRecord = (item: MasterApiItem, citiesById: Map<number, string>): MasterRecord => ({
  id: String(item.id),
  areaName: item.name,
  cityId: item.parentId != null ? String(item.parentId) : "",
  city: item.parentId != null ? citiesById.get(item.parentId) ?? "" : "",
  status: toDisplayStatus(item.status),
  createdDate: toDateOnly(item.createdAt),
});

const areaApi: MasterApiConfig = {
  async list() {
    const [items, citiesById] = await Promise.all([masterCrudService.list("areas"), buildIdNameMap("cities")]);
    return items.map((item) => areaItemToRecord(item, citiesById));
  },
  async create(formValues) {
    const name = fieldToText(formValues.areaName);
    const parentId = Number(formValues.cityId);
    const item = await masterCrudService.create("areas", { name, code: name, parentId, status: toApiStatus(String(formValues.status ?? "Active")) });
    const citiesById = await buildIdNameMap("cities");
    return areaItemToRecord(item, citiesById);
  },
  async update(id, formValues) {
    const name = fieldToText(formValues.areaName);
    const parentId = formValues.cityId ? Number(formValues.cityId) : undefined;
    const item = await masterCrudService.update("areas", id, { name, code: name, parentId });
    const citiesById = await buildIdNameMap("cities");
    return areaItemToRecord(item, citiesById);
  },
  async updateStatus(id, status) {
    const item = await masterCrudService.updateStatus("areas", id, toApiStatus(status));
    const citiesById = await buildIdNameMap("cities");
    return areaItemToRecord(item, citiesById);
  },
  async remove(id) {
    await masterCrudService.remove("areas", id);
  },
};

// --- Live-backed flat property-attribute masters ---------------------------
// Wired against 1SqrPropertyBackend's `/admin/masters/property-types|amenities
// |facing-directions|bhk-options|ready-states` (adminMasterRouter), verified
// live on 2026-09-17: authenticated GET list, POST create, PATCH .../status
// and DELETE confirmed end-to-end (create -> read back -> status toggle ->
// soft delete -> 404 on re-fetch) for all five types, then cleaned up. Exact
// registered type-strings confirmed from
// 1SqrPropertyBackend/src/config/master.config.ts: "property-types"
// (model: propertyType), "amenities" (model: amenity), "facing-directions"
// (model: facing), "bhk-options" (model: bhkType), "ready-states" (storage:
// masterRecord, recordType: "ready-states"). None of the five declare
// `parentType`/`parentKey` — all are flat/standalone, unlike City/Area, so no
// cascading dropdown wiring is needed here. Same confirmed-broken plain
// PATCH .../:id ("Edit") endpoint as State/City/Area applies to all five;
// `update()` is still wired below so Edit starts working the moment that
// backend fix (already written, not yet deployed) ships.
//
// Icon persistence (property-types / amenities "Icon" field): the
// `iconFileId` field uploads a real file to `/uploads` and the returned
// fileId is sent as `metadata: { iconFileId }` on create/update. Backend
// commit 62c90e0 ("fix: persist iconFileId for property-type/amenity master
// records") added real `icon_file_id` FK columns on both tables and wired
// `master.service.ts` to read/write them — no frontend change required, the
// existing payload shape here is already correct and the icon now survives
// a page reload.
const facingDirectionItemToRecord = (item: MasterApiItem): MasterRecord => ({
  id: String(item.id),
  facingDirectionName: item.name,
  status: toDisplayStatus(item.status),
  createdDate: toDateOnly(item.createdAt),
});

const facingDirectionApi: MasterApiConfig = {
  async list() {
    const items = await masterCrudService.list("facing-directions");
    return items.map(facingDirectionItemToRecord);
  },
  async create(formValues) {
    const name = fieldToText(formValues.facingDirectionName);
    const item = await masterCrudService.create("facing-directions", { name, code: name, status: toApiStatus(String(formValues.status ?? "Active")) });
    return facingDirectionItemToRecord(item);
  },
  async update(id, formValues) {
    const name = fieldToText(formValues.facingDirectionName);
    const item = await masterCrudService.update("facing-directions", id, { name, code: name });
    return facingDirectionItemToRecord(item);
  },
  async updateStatus(id, status) {
    const item = await masterCrudService.updateStatus("facing-directions", id, toApiStatus(status));
    return facingDirectionItemToRecord(item);
  },
  async remove(id) {
    await masterCrudService.remove("facing-directions", id);
  },
};

const bhkOptionItemToRecord = (item: MasterApiItem): MasterRecord => ({
  id: String(item.id),
  bhkOptionName: item.name,
  status: toDisplayStatus(item.status),
  createdDate: toDateOnly(item.createdAt),
});

const bhkOptionApi: MasterApiConfig = {
  async list() {
    const items = await masterCrudService.list("bhk-options");
    return items.map(bhkOptionItemToRecord);
  },
  async create(formValues) {
    const name = fieldToText(formValues.bhkOptionName);
    // "bhk-options" (model: bhkType) has neither `codeField` nor `slugField`
    // in master.config.ts, so `code` is required by the request schema but
    // ignored server-side (dedupes on `name` instead) — same as city/area.
    const item = await masterCrudService.create("bhk-options", { name, code: name, status: toApiStatus(String(formValues.status ?? "Active")) });
    return bhkOptionItemToRecord(item);
  },
  async update(id, formValues) {
    const name = fieldToText(formValues.bhkOptionName);
    const item = await masterCrudService.update("bhk-options", id, { name, code: name });
    return bhkOptionItemToRecord(item);
  },
  async updateStatus(id, status) {
    const item = await masterCrudService.updateStatus("bhk-options", id, toApiStatus(status));
    return bhkOptionItemToRecord(item);
  },
  async remove(id) {
    await masterCrudService.remove("bhk-options", id);
  },
};

const readyStateItemToRecord = (item: MasterApiItem): MasterRecord => ({
  id: String(item.id),
  readyStateName: item.name,
  status: toDisplayStatus(item.status),
  createdDate: toDateOnly(item.createdAt),
});

const readyStateApi: MasterApiConfig = {
  async list() {
    const items = await masterCrudService.list("ready-states");
    return items.map(readyStateItemToRecord);
  },
  async create(formValues) {
    const name = fieldToText(formValues.readyStateName);
    const item = await masterCrudService.create("ready-states", { name, code: name, status: toApiStatus(String(formValues.status ?? "Active")) });
    return readyStateItemToRecord(item);
  },
  async update(id, formValues) {
    const name = fieldToText(formValues.readyStateName);
    const item = await masterCrudService.update("ready-states", id, { name, code: name });
    return readyStateItemToRecord(item);
  },
  async updateStatus(id, status) {
    const item = await masterCrudService.updateStatus("ready-states", id, toApiStatus(status));
    return readyStateItemToRecord(item);
  },
  async remove(id) {
    await masterCrudService.remove("ready-states", id);
  },
};

const propertyTypeItemToRecord = (item: MasterApiItem): MasterRecord => ({
  id: String(item.id),
  propertyTypeName: item.name,
  // See the KNOWN CONTRACT GAP note above this block — always "" today
  // because the backend never persists/returns this, regardless of what
  // was sent on create/update.
  iconFileId: typeof item.metadata?.iconFileId === "string" ? (item.metadata.iconFileId as string) : "",
  status: toDisplayStatus(item.status),
  createdDate: toDateOnly(item.createdAt),
});

const propertyTypeApi: MasterApiConfig = {
  async list() {
    const items = await masterCrudService.list("property-types");
    return items.map(propertyTypeItemToRecord);
  },
  async create(formValues) {
    const name = fieldToText(formValues.propertyTypeName);
    const iconFileId = fieldToText(formValues.iconFileId);
    const item = await masterCrudService.create("property-types", {
      name,
      code: name,
      status: toApiStatus(String(formValues.status ?? "Active")),
      metadata: iconFileId ? { iconFileId } : undefined,
    });
    return propertyTypeItemToRecord(item);
  },
  async update(id, formValues) {
    const name = fieldToText(formValues.propertyTypeName);
    const iconFileId = fieldToText(formValues.iconFileId);
    const item = await masterCrudService.update("property-types", id, {
      name,
      code: name,
      metadata: iconFileId ? { iconFileId } : undefined,
    });
    return propertyTypeItemToRecord(item);
  },
  async updateStatus(id, status) {
    const item = await masterCrudService.updateStatus("property-types", id, toApiStatus(status));
    return propertyTypeItemToRecord(item);
  },
  async remove(id) {
    await masterCrudService.remove("property-types", id);
  },
};

const amenityItemToRecord = (item: MasterApiItem): MasterRecord => ({
  id: String(item.id),
  amenityName: item.name,
  // See the KNOWN CONTRACT GAP note above — always "" today; unlike
  // PropertyType, the `Amenity` Prisma model does have a real `icon` string
  // column, but `toModelData()` still never maps `metadata.iconFileId` (or
  // anything else) into it for non-"area" model types, so it is equally
  // unpersisted via this generic endpoint.
  iconFileId: typeof item.metadata?.iconFileId === "string" ? (item.metadata.iconFileId as string) : "",
  status: toDisplayStatus(item.status),
  createdDate: toDateOnly(item.createdAt),
});

const amenityApi: MasterApiConfig = {
  async list() {
    const items = await masterCrudService.list("amenities");
    return items.map(amenityItemToRecord);
  },
  async create(formValues) {
    const name = fieldToText(formValues.amenityName);
    const iconFileId = fieldToText(formValues.iconFileId);
    const item = await masterCrudService.create("amenities", {
      name,
      code: name,
      status: toApiStatus(String(formValues.status ?? "Active")),
      metadata: iconFileId ? { iconFileId } : undefined,
    });
    return amenityItemToRecord(item);
  },
  async update(id, formValues) {
    const name = fieldToText(formValues.amenityName);
    const iconFileId = fieldToText(formValues.iconFileId);
    const item = await masterCrudService.update("amenities", id, {
      name,
      code: name,
      metadata: iconFileId ? { iconFileId } : undefined,
    });
    return amenityItemToRecord(item);
  },
  async updateStatus(id, status) {
    const item = await masterCrudService.updateStatus("amenities", id, toApiStatus(status));
    return amenityItemToRecord(item);
  },
  async remove(id) {
    await masterCrudService.remove("amenities", id);
  },
};

export const masterConfigs: MasterConfig[] = [
  {
    key: "state",
    title: "State",
    searchKeys: ["stateName", "stateCode"],
    fields: [
      { key: "stateName", label: "State Name", required: true },
      { key: "stateCode", label: "State Code", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "stateName", label: "State Name", sortable: true },
      { key: "stateCode", label: "Code", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "createdDate", label: "Created Date", sortable: true },
    ],
    initialRows: [],
    api: stateApi,
  },
  {
    key: "city",
    title: "City",
    searchKeys: ["cityName", "state"],
    fields: [
      { key: "stateId", label: "State", type: "select", required: true, options: (records) => (records.state ?? []).map((row) => ({ value: String(row.id), label: String(row.stateName) })) },
      { key: "cityName", label: "City Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "cityName", label: "City Name", sortable: true },
      { key: "state", label: "State", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    filters: [{ key: "state", label: "State", options: (records) => (records.state ?? []).map((row) => String(row.stateName)) }],
    initialRows: [],
    api: cityApi,
  },
  {
    key: "area",
    title: "Area",
    searchKeys: ["areaName", "city"],
    fields: [
      { key: "cityId", label: "City", type: "select", required: true, options: (records) => (records.city ?? []).map((row) => ({ value: String(row.id), label: String(row.cityName) })) },
      { key: "areaName", label: "Area Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "areaName", label: "Area Name", sortable: true },
      { key: "city", label: "City", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    filters: [{ key: "city", label: "City", options: (records) => (records.city ?? []).map((row) => String(row.cityName)) }],
    initialRows: [],
    api: areaApi,
  },
  {
    key: "propertyType",
    title: "Property Type",
    searchKeys: ["propertyTypeName"],
    fields: [
      { key: "propertyTypeName", label: "Property Type Name", required: true },
      { key: "iconFileId", label: "Icon", type: "image", uploadKind: "image", uploadModule: "property" },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "propertyTypeName", label: "Property Type Name", sortable: true },
      { key: "iconFileId", label: "Icon File ID" },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: [],
    api: propertyTypeApi,
  },
  {
    key: "propertyCategory",
    title: "Property Category",
    searchKeys: ["propertyCategoryName"],
    fields: [
      { key: "propertyCategoryName", label: "Property Category Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "propertyCategoryName", label: "Property Category", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: ["Residential", "Commercial", "Land"].map((propertyCategoryName, index) => ({ ...withBase(`PCAT-${index + 1}`), propertyCategoryName })),
  },
  {
    key: "propertyStatus",
    title: "Property Status",
    searchKeys: ["propertyStatusName"],
    fields: [
      { key: "propertyStatusName", label: "Property Status Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "propertyStatusName", label: "Property Status", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: ["Draft", "Pending", "Approved", "Rejected", "Sold"].map((propertyStatusName, index) => ({ ...withBase(`PSTATUS-${index + 1}`), propertyStatusName })),
  },
  {
    key: "amenities",
    title: "Amenities",
    searchKeys: ["amenityName"],
    fields: [
      { key: "amenityName", label: "Amenity Name", required: true },
      { key: "iconFileId", label: "Icon", type: "image", uploadKind: "image", uploadModule: "property" },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "amenityName", label: "Amenity", sortable: true },
      { key: "iconFileId", label: "Icon File ID" },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: [],
    api: amenityApi,
  },
  {
    key: "facingDirection",
    title: "Facing Direction",
    searchKeys: ["facingDirectionName"],
    fields: [
      { key: "facingDirectionName", label: "Facing Direction Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "facingDirectionName", label: "Facing Direction", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "createdDate", label: "Created Date", sortable: true },
    ],
    initialRows: [],
    api: facingDirectionApi,
  },
  {
    key: "bhkOption",
    title: "BHK Option",
    searchKeys: ["bhkOptionName"],
    fields: [
      { key: "bhkOptionName", label: "BHK Option Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "bhkOptionName", label: "BHK Option", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "createdDate", label: "Created Date", sortable: true },
    ],
    initialRows: [],
    api: bhkOptionApi,
  },
  {
    key: "readyState",
    title: "Ready State",
    searchKeys: ["readyStateName"],
    fields: [
      { key: "readyStateName", label: "Ready State Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "readyStateName", label: "Ready State", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "createdDate", label: "Created Date", sortable: true },
    ],
    initialRows: [],
    api: readyStateApi,
  },
  // "banks" mock config entry removed 2026-09-18: Banks is a real, dedicated
  // backend resource (`/admin/loans/banks`, distinct boolean `isActive`
  // contract and BANK_* permissions), now live-wired at
  // `src/modules/masters/BankManagementPage.tsx` / `src/services/bank.service.ts`
  // and reachable from its own "Bank Management" sidebar entry — not the
  // generic master-directory tabs. See docs/PROJECT_MASTER.md and this
  // batch's contract notes on `apiEndpoints.adminLoans`.
  {
    key: "loanTypes",
    title: "Loan Types",
    searchKeys: ["loanTypeName"],
    fields: [
      { key: "loanTypeName", label: "Loan Type Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "loanTypeName", label: "Loan Type", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: ["Home Loan", "Plot Loan", "Construction Loan", "Commercial Property Loan"].map((loanTypeName, index) => ({ ...withBase(`LOAN-${index + 1}`), loanTypeName })),
  },
  // "banner" mock config entry removed 2026-09-18, then reinstated
  // 2026-09-19 as a redirect-only tab: Banner is a real, dedicated backend
  // resource (`/admin/banners`, dedicated status-toggle endpoint and
  // BANNER_* permissions), live-wired at
  // `src/modules/masters/BannerManagementPage.tsx` /
  // `src/services/banner.service.ts`. The user still wants a "Banner" tab
  // visible in the Masters tab bar for discoverability, but it must not
  // resurrect the old mock table — selecting this tab just navigates to the
  // real `/banners` page (see `redirectPath` handling in
  // MasterManagementPage.tsx). The top-level "Banner Management" sidebar
  // entry stays too; both paths lead to the same real page. See
  // docs/PROJECT_MASTER.md and this batch's contract notes on
  // `apiEndpoints.adminBanners`.
  {
    key: "banner",
    title: "Banner",
    redirectPath: "/banners",
    searchKeys: [],
    fields: [],
    columns: [],
    initialRows: [],
  },
  {
    key: "constructionPlan",
    title: "Construction Plan",
    searchKeys: ["planName", "planCode", "badge"],
    fullPageCreatePath: "/masters/construction-plans/new",
    fields: [],
    columns: [
      { key: "planName", label: "Plan Name", sortable: true },
      { key: "planCode", label: "Code", sortable: true },
      { key: "pricePerSqFt", label: "Price / Sq.Ft", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: [
      { ...withBase("CP-1", "Published"), planName: "Basic", planCode: "BASIC", pricePerSqFt: 1500, badge: "" },
      { ...withBase("CP-2", "Published"), planName: "Premium", planCode: "PREMIUM", pricePerSqFt: 2200, badge: "Recommended" },
    ] satisfies MasterRecord[],
  },
];

export const initialMasterRecords = masterConfigs.reduce<Record<string, MasterRecord[]>>((acc, config) => {
  acc[config.key] = config.initialRows;
  return acc;
}, {});
