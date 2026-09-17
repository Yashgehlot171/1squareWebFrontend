import { Autocomplete, Box, Checkbox, Divider, FormControlLabel, Grid, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppInput } from "../../components/common/AppInput";
import { AppSelect } from "../../components/common/AppSelect";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { ToastNotification } from "../../components/common/ToastNotification";
import {
  PROPERTY_STATUSES,
  propertyService,
  type AdminPropertyInput,
  type AdminPropertyRecord,
  type PropertyMasterOption,
  type PropertyStatusValue,
} from "../../services/property.service";
import type { OptionItem } from "../../types";

/**
 * Real 11-value status vocabulary (see propertyService.PROPERTY_STATUSES),
 * replacing the previous 5-value PropertyRecord["status"] enum.
 */
const statusOptions: OptionItem[] = PROPERTY_STATUSES.map((status) => ({
  label: status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" "),
  value: status,
}));

/** String-keyed mirror of AdminPropertyInput so every MUI input/select can bind a plain string value; converted to real types in buildPayload(). */
interface PropertyFormState {
  title: string;
  description: string;
  propertyTypeId: string;
  propertyCategoryId: string;
  listingTypeId: string;
  bhkTypeId: string;
  facingId: string;
  constructionQualityId: string;
  price: string;
  isPriceNegotiable: boolean;
  carpetAreaSqft: string;
  builtUpAreaSqft: string;
  plotAreaSqft: string;
  bedrooms: string;
  bathrooms: string;
  balconies: string;
  parkingCount: string;
  floorNumber: string;
  totalFloors: string;
  constructionYear: string;
  propertyAge: string;
  readyState: string;
  furnishing: string;
  ownership: string;
  amenityIds: number[];
  stateId: string;
  cityId: string;
  areaId: string;
  address: string;
  addressLine2: string;
  landmark: string;
  pincode: string;
  status: PropertyStatusValue;
}

const emptyForm: PropertyFormState = {
  title: "",
  description: "",
  propertyTypeId: "",
  propertyCategoryId: "",
  listingTypeId: "",
  bhkTypeId: "",
  facingId: "",
  constructionQualityId: "",
  price: "",
  isPriceNegotiable: false,
  carpetAreaSqft: "",
  builtUpAreaSqft: "",
  plotAreaSqft: "",
  bedrooms: "",
  bathrooms: "",
  balconies: "",
  parkingCount: "",
  floorNumber: "",
  totalFloors: "",
  constructionYear: "",
  propertyAge: "",
  readyState: "",
  furnishing: "",
  ownership: "",
  amenityIds: [],
  stateId: "",
  cityId: "",
  areaId: "",
  address: "",
  addressLine2: "",
  landmark: "",
  pincode: "",
  status: "draft",
};

/**
 * Prefill from the real GET /admin/properties/:id shape (`presentProperty`,
 * modeled as AdminPropertyRecord). Location/basic FK relations come back as
 * full `{ id, name }` refs, so ids are read from `.id` directly. `location`
 * carries `state`/`city`/`area` refs plus `addressLine1` (not `address`, per
 * presentProperty's own naming) — mapped here accordingly.
 *
 * `constructionYear`/`readyState`/`furnishing`/`ownership` live in the
 * backend's dynamic `details` JSON column and are surfaced at
 * `record.basic.details` (`presentProperty()` spreads `property.details ?? {}`
 * verbatim — verified against `PropertyService.details()`,
 * 1SqrPropertyBackend/src/services/property.service.ts:359-373, which stores
 * these four keys under those exact names). They must be read from there, not
 * hardcoded to "" — buildPayload() always resends these four fields, and the
 * backend's `propertyData()` only strips `undefined` (not `null`), so a blank
 * "" here would be sent as `null` and silently wipe the stored value on every
 * edit, regardless of whether the admin touched the field.
 *
 * `isPriceNegotiable` cannot be prefilled: `presentProperty()` never returns
 * it at all (confirmed against the same source), so there is no real value to
 * read. It is left `false` here only as a form default; buildPayload() omits
 * this field entirely on update so that default is never sent back and cannot
 * overwrite a true stored value. See buildPayload()'s comment for the caveat.
 */
function mapRecordToForm(record: AdminPropertyRecord): PropertyFormState {
  const details = record.basic.details ?? {};
  const detailString = (value: unknown): string => (typeof value === "string" ? value : "");
  return {
    title: record.title,
    description: record.description ?? "",
    propertyTypeId: record.basic.propertyType ? String(record.basic.propertyType.id) : "",
    propertyCategoryId: record.basic.category ? String(record.basic.category.id) : "",
    listingTypeId: record.basic.listingType ? String(record.basic.listingType.id) : "",
    bhkTypeId: record.basic.bhk ? String(record.basic.bhk.id) : "",
    facingId: record.basic.facing ? String(record.basic.facing.id) : "",
    constructionQualityId: record.basic.constructionQuality ? String(record.basic.constructionQuality.id) : "",
    price: String(record.price ?? ""),
    isPriceNegotiable: false,
    carpetAreaSqft: record.area.carpetAreaSqft != null ? String(record.area.carpetAreaSqft) : "",
    builtUpAreaSqft: record.area.builtUpAreaSqft != null ? String(record.area.builtUpAreaSqft) : "",
    plotAreaSqft: record.area.plotAreaSqft != null ? String(record.area.plotAreaSqft) : "",
    bedrooms: record.basic.bedrooms != null ? String(record.basic.bedrooms) : "",
    bathrooms: record.basic.bathrooms != null ? String(record.basic.bathrooms) : "",
    balconies: record.basic.balconies != null ? String(record.basic.balconies) : "",
    parkingCount: record.basic.parking != null ? String(record.basic.parking) : "",
    floorNumber: record.basic.floorNumber != null ? String(record.basic.floorNumber) : "",
    totalFloors: record.basic.totalFloors != null ? String(record.basic.totalFloors) : "",
    constructionYear: details.constructionYear != null ? String(details.constructionYear) : "",
    propertyAge: record.basic.propertyAge != null ? String(record.basic.propertyAge) : "",
    readyState: detailString(details.readyState),
    furnishing: detailString(details.furnishing),
    ownership: detailString(details.ownership),
    amenityIds: record.amenities.map((amenity) => amenity.id),
    stateId: record.location?.state ? String(record.location.state.id) : "",
    cityId: record.location?.city ? String(record.location.city.id) : "",
    areaId: record.location?.area ? String(record.location.area.id) : "",
    address: record.location?.addressLine1 ?? "",
    addressLine2: record.location?.addressLine2 ?? "",
    landmark: record.location?.landmark ?? "",
    pincode: record.location?.pincode ?? "",
    status: (PROPERTY_STATUSES as readonly string[]).includes(record.status) ? (record.status as PropertyStatusValue) : "draft",
  };
}

const formSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  propertyTypeId: z.string().min(1, "Property type is required."),
  propertyCategoryId: z.string().min(1, "Property category is required."),
  listingTypeId: z.string().min(1, "Listing type is required."),
  price: z
    .string()
    .min(1, "Price is required.")
    .refine((value) => Number(value) > 0, "Price must be greater than 0."),
  stateId: z.string().min(1, "State is required."),
  cityId: z.string().min(1, "City is required."),
  address: z.string().trim().min(1, "Address is required."),
});

/** "" -> undefined, otherwise Number(value); used for every optional numeric field. */
function toOptionalNumber(value: string): number | undefined {
  return value.trim() === "" ? undefined : Number(value);
}

function toOptionalString(value: string): string | undefined {
  return value.trim() === "" ? undefined : value.trim();
}

function toOptions(items: PropertyMasterOption[]): OptionItem[] {
  return items.map((item) => ({ label: item.name, value: String(item.id) }));
}

/**
 * Builds the real AdminPropertyInput body. `media` is intentionally omitted
 * (defaults to empty arrays server-side; no image/document upload UI in this
 * pass) and so are `ownerId`/`assignedAgentId` (no user/broker picker exists
 * anywhere in this admin app yet — on create this lets the backend default
 * ownerId to the acting admin; on update it leaves existing
 * ownership/assignment untouched, per propertyService.update()'s
 * only-touch-what-you-send semantics).
 *
 * `isPriceNegotiable` is deliberately omitted from the payload when
 * `isEdit` is true. `presentProperty()` never returns this field (see
 * mapRecordToForm()'s comment), so the form's value after prefill is always
 * the `false` default, never the record's real stored value — sending it on
 * every update would silently overwrite a `true` value back to `false`. On
 * create there is no stored value to protect, and the admin is explicitly
 * setting it for a new listing, so it is sent as normal (the backend schema
 * defaults it to `false` anyway if it were ever omitted there too).
 * Follow-up needed: this form cannot safely support editing
 * `isPriceNegotiable` until a backend change adds it to `presentProperty()`'s
 * response — out of scope for this pass.
 */
function buildPayload(form: PropertyFormState, isEdit: boolean): AdminPropertyInput {
  const payload: AdminPropertyInput = {
    title: form.title.trim(),
    description: toOptionalString(form.description) ?? null,
    propertyTypeId: Number(form.propertyTypeId),
    propertyCategoryId: Number(form.propertyCategoryId),
    listingTypeId: Number(form.listingTypeId),
    price: Number(form.price),
    carpetAreaSqft: toOptionalNumber(form.carpetAreaSqft) ?? null,
    builtUpAreaSqft: toOptionalNumber(form.builtUpAreaSqft) ?? null,
    plotAreaSqft: toOptionalNumber(form.plotAreaSqft) ?? null,
    bhkTypeId: toOptionalNumber(form.bhkTypeId) ?? null,
    bedrooms: toOptionalNumber(form.bedrooms) ?? null,
    bathrooms: toOptionalNumber(form.bathrooms) ?? null,
    balconies: toOptionalNumber(form.balconies) ?? null,
    parkingCount: toOptionalNumber(form.parkingCount) ?? null,
    facingId: toOptionalNumber(form.facingId) ?? null,
    constructionQualityId: toOptionalNumber(form.constructionQualityId) ?? null,
    floorNumber: toOptionalNumber(form.floorNumber) ?? null,
    totalFloors: toOptionalNumber(form.totalFloors) ?? null,
    constructionYear: toOptionalNumber(form.constructionYear) ?? null,
    propertyAge: toOptionalNumber(form.propertyAge) ?? null,
    readyState: toOptionalString(form.readyState) ?? null,
    furnishing: toOptionalString(form.furnishing) ?? null,
    ownership: toOptionalString(form.ownership) ?? null,
    amenityIds: form.amenityIds,
    location: {
      stateId: Number(form.stateId),
      cityId: Number(form.cityId),
      areaId: toOptionalNumber(form.areaId) ?? null,
      address: form.address.trim(),
      addressLine2: toOptionalString(form.addressLine2) ?? null,
      landmark: toOptionalString(form.landmark) ?? null,
      pincode: toOptionalString(form.pincode) ?? null,
    },
    status: form.status,
  };
  if (!isEdit) {
    payload.isPriceNegotiable = form.isPriceNegotiable;
  }
  return payload;
}

export function PropertyFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<PropertyFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const [propertyTypes, setPropertyTypes] = useState<PropertyMasterOption[]>([]);
  const [propertyCategories, setPropertyCategories] = useState<PropertyMasterOption[]>([]);
  const [listingTypes, setListingTypes] = useState<PropertyMasterOption[]>([]);
  const [bhkOptions, setBhkOptions] = useState<PropertyMasterOption[]>([]);
  const [facingOptions, setFacingOptions] = useState<PropertyMasterOption[]>([]);
  const [constructionQualities, setConstructionQualities] = useState<PropertyMasterOption[]>([]);
  const [amenityOptions, setAmenityOptions] = useState<PropertyMasterOption[]>([]);
  const [states, setStates] = useState<PropertyMasterOption[]>([]);
  const [cities, setCities] = useState<PropertyMasterOption[]>([]);
  const [areas, setAreas] = useState<PropertyMasterOption[]>([]);

  // Static master dropdown data, fetched once.
  useEffect(() => {
    propertyService.getPropertyTypes().then((response) => setPropertyTypes(response.data.items));
    propertyService.getPropertyCategories().then((response) => setPropertyCategories(response.data.items));
    propertyService.getListingTypes().then((response) => setListingTypes(response.data.items));
    propertyService.getBhkOptions().then((response) => setBhkOptions(response.data.items));
    propertyService.getFacingDirections().then((response) => setFacingOptions(response.data.items));
    propertyService.getConstructionQualities().then((response) => setConstructionQualities(response.data.items));
    propertyService.getAmenityOptions().then((response) => setAmenityOptions(response.data.items));
    propertyService.getStates().then((response) => setStates(response.data.items));
  }, []);

  // Edit prefill. Cities/areas for the record's existing state/city are
  // fetched right after so the location selects render populated, not blank.
  useEffect(() => {
    if (!id) {
      return;
    }
    propertyService.getPropertyById(id).then((response) => {
      if (response.data) {
        const mapped = mapRecordToForm(response.data);
        setForm(mapped);
        if (mapped.stateId) {
          propertyService.getCities(Number(mapped.stateId)).then((citiesResponse) => setCities(citiesResponse.data.items));
        }
        if (mapped.cityId) {
          propertyService.getAreas(Number(mapped.cityId)).then((areasResponse) => setAreas(areasResponse.data.items));
        }
      }
      setLoading(false);
    });
  }, [id]);

  // Cascading state -> city -> area: re-fetch (and clear the now-stale
  // downstream selection) whenever the user changes the parent select.
  const handleStateChange = (value: string) => {
    setForm((prev) => ({ ...prev, stateId: value, cityId: "", areaId: "" }));
    setAreas([]);
    if (value) {
      propertyService.getCities(Number(value)).then((response) => setCities(response.data.items));
    } else {
      setCities([]);
    }
  };

  const handleCityChange = (value: string) => {
    setForm((prev) => ({ ...prev, cityId: value, areaId: "" }));
    if (value) {
      propertyService.getAreas(Number(value)).then((response) => setAreas(response.data.items));
    } else {
      setAreas([]);
    }
  };

  const selectedAmenities = useMemo(
    () => amenityOptions.filter((amenity) => form.amenityIds.includes(amenity.id)),
    [amenityOptions, form.amenityIds],
  );

  const handleSubmit = async () => {
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const payload = buildPayload(form, isEdit);
      if (isEdit && id) {
        await propertyService.updateProperty(id, payload);
      } else {
        await propertyService.createProperty(payload);
      }
      setToastOpen(true);
      setTimeout(() => navigate("/properties"), 500);
    } catch {
      // Global response interceptor already surfaces an error toast.
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <PageHeader
        title={isEdit ? "Edit Property" : "Add Property"}
        subtitle="Live property form backed by POST/PATCH /admin/properties, with FK dropdowns sourced from master data."
      />
      <Box maxWidth={960}>
        <Stack spacing={2.5}>
          <AppCard title="Basic Information">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <AppInput
                  label="Title"
                  value={form.title}
                  error={Boolean(errors.title)}
                  helperText={errors.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <AppInput
                  label="Description"
                  value={form.description}
                  multiline
                  minRows={3}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppSelect
                  label="Property Type"
                  value={form.propertyTypeId}
                  options={toOptions(propertyTypes)}
                  error={Boolean(errors.propertyTypeId)}
                  helperText={errors.propertyTypeId}
                  onChange={(value) => setForm((prev) => ({ ...prev, propertyTypeId: value }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppSelect
                  label="Property Category"
                  value={form.propertyCategoryId}
                  options={toOptions(propertyCategories)}
                  error={Boolean(errors.propertyCategoryId)}
                  helperText={errors.propertyCategoryId}
                  onChange={(value) => setForm((prev) => ({ ...prev, propertyCategoryId: value }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppSelect
                  label="Listing Type"
                  value={form.listingTypeId}
                  options={toOptions(listingTypes)}
                  error={Boolean(errors.listingTypeId)}
                  helperText={errors.listingTypeId}
                  onChange={(value) => setForm((prev) => ({ ...prev, listingTypeId: value }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppSelect
                  label="Status"
                  value={form.status}
                  options={statusOptions}
                  onChange={(value) => setForm((prev) => ({ ...prev, status: value as PropertyStatusValue }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppInput
                  label="Price"
                  type="number"
                  value={form.price}
                  error={Boolean(errors.price)}
                  helperText={errors.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  sx={{ mt: 0.5 }}
                  control={
                    <Checkbox
                      checked={form.isPriceNegotiable}
                      onChange={(event) => setForm((prev) => ({ ...prev, isPriceNegotiable: event.target.checked }))}
                    />
                  }
                  label="Price negotiable"
                />
              </Grid>
            </Grid>
          </AppCard>

          <AppCard title="Configuration" subtitle="All fields below are optional.">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <AppSelect label="BHK" value={form.bhkTypeId} options={toOptions(bhkOptions)} onChange={(value) => setForm((prev) => ({ ...prev, bhkTypeId: value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppSelect label="Facing" value={form.facingId} options={toOptions(facingOptions)} onChange={(value) => setForm((prev) => ({ ...prev, facingId: value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppSelect
                  label="Construction Quality"
                  value={form.constructionQualityId}
                  options={toOptions(constructionQualities)}
                  onChange={(value) => setForm((prev) => ({ ...prev, constructionQualityId: value }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppInput label="Carpet Area (sqft)" type="number" value={form.carpetAreaSqft} onChange={(event) => setForm((prev) => ({ ...prev, carpetAreaSqft: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppInput label="Built-up Area (sqft)" type="number" value={form.builtUpAreaSqft} onChange={(event) => setForm((prev) => ({ ...prev, builtUpAreaSqft: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppInput label="Plot Area (sqft)" type="number" value={form.plotAreaSqft} onChange={(event) => setForm((prev) => ({ ...prev, plotAreaSqft: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <AppInput label="Bedrooms" type="number" value={form.bedrooms} onChange={(event) => setForm((prev) => ({ ...prev, bedrooms: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <AppInput label="Bathrooms" type="number" value={form.bathrooms} onChange={(event) => setForm((prev) => ({ ...prev, bathrooms: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <AppInput label="Balconies" type="number" value={form.balconies} onChange={(event) => setForm((prev) => ({ ...prev, balconies: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <AppInput label="Parking Count" type="number" value={form.parkingCount} onChange={(event) => setForm((prev) => ({ ...prev, parkingCount: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <AppInput label="Floor Number" type="number" value={form.floorNumber} onChange={(event) => setForm((prev) => ({ ...prev, floorNumber: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <AppInput label="Total Floors" type="number" value={form.totalFloors} onChange={(event) => setForm((prev) => ({ ...prev, totalFloors: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <AppInput label="Construction Year" type="number" value={form.constructionYear} onChange={(event) => setForm((prev) => ({ ...prev, constructionYear: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <AppInput label="Property Age (years)" type="number" value={form.propertyAge} onChange={(event) => setForm((prev) => ({ ...prev, propertyAge: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppInput label="Ready State" value={form.readyState} onChange={(event) => setForm((prev) => ({ ...prev, readyState: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppInput label="Furnishing" value={form.furnishing} onChange={(event) => setForm((prev) => ({ ...prev, furnishing: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppInput label="Ownership" value={form.ownership} onChange={(event) => setForm((prev) => ({ ...prev, ownership: event.target.value }))} />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  size="small"
                  options={amenityOptions}
                  value={selectedAmenities}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_event, value) => setForm((prev) => ({ ...prev, amenityIds: value.map((item) => item.id) }))}
                  renderInput={(params) => <TextField {...params} label="Amenities" />}
                />
              </Grid>
            </Grid>
          </AppCard>

          <AppCard title="Location">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <AppSelect
                  label="State"
                  value={form.stateId}
                  options={toOptions(states)}
                  error={Boolean(errors.stateId)}
                  helperText={errors.stateId}
                  onChange={handleStateChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppSelect
                  label="City"
                  value={form.cityId}
                  options={toOptions(cities)}
                  error={Boolean(errors.cityId)}
                  helperText={errors.cityId}
                  onChange={handleCityChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppSelect
                  label="Area (optional)"
                  value={form.areaId}
                  options={toOptions(areas)}
                  onChange={(value) => setForm((prev) => ({ ...prev, areaId: value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <AppInput
                  label="Address"
                  value={form.address}
                  error={Boolean(errors.address)}
                  helperText={errors.address}
                  onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AppInput label="Address Line 2" value={form.addressLine2} onChange={(event) => setForm((prev) => ({ ...prev, addressLine2: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AppInput label="Landmark" value={form.landmark} onChange={(event) => setForm((prev) => ({ ...prev, landmark: event.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppInput label="Pincode" value={form.pincode} onChange={(event) => setForm((prev) => ({ ...prev, pincode: event.target.value }))} />
              </Grid>
            </Grid>
          </AppCard>

          <Divider />
          <Typography variant="caption" color="text.secondary">
            Media/document upload and owner/broker assignment are not part of this form yet — new properties default to the
            acting admin as owner, and edits leave the current owner/broker unchanged.
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <AppButton onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : isEdit ? "Update Property" : "Create Property"}
            </AppButton>
            <AppButton variant="text" onClick={() => navigate("/properties")}>
              Cancel
            </AppButton>
          </Stack>
        </Stack>
      </Box>
      <ToastNotification open={toastOpen} message={`Property ${isEdit ? "updated" : "created"} successfully.`} onClose={() => setToastOpen(false)} />
    </>
  );
}
