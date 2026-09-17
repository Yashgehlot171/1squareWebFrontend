import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import SquareFootRoundedIcon from "@mui/icons-material/SquareFootRounded";
import { Avatar, Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { AppCard } from "../../components/common/AppCard";
import { EmptyState } from "../../components/common/EmptyState";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { propertyService } from "../../services/property.service";
import type { AdminPropertyRecord, PropertyStatusHistoryEntry } from "../../services/property.service";

interface DetailItem {
  label: string;
  value: unknown;
  render?: (value: unknown) => ReactNode;
}

interface DetailSectionProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  items: DetailItem[];
}

function valueExists(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== undefined && value !== null && value !== "";
}

function displayValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "number") {
    return value.toLocaleString("en-IN");
  }
  return String(value);
}

function currency(value: unknown) {
  if (!valueExists(value)) {
    return "";
  }
  return `INR ${Number(value).toLocaleString("en-IN")}`;
}

function humanizeKey(key: string) {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function DetailSection({ title, subtitle, icon, items }: DetailSectionProps) {
  const visibleItems = items.filter((item) => valueExists(item.value));

  if (!visibleItems.length) {
    return null;
  }

  return (
    <AppCard title={title} subtitle={subtitle}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <Avatar sx={{ bgcolor: "primary.light", color: "primary.main" }}>{icon}</Avatar>
        <Typography variant="subtitle1">{title}</Typography>
      </Stack>
      <Grid container spacing={2}>
        {visibleItems.map((item) => (
          <Grid item xs={12} sm={6} lg={4} key={item.label}>
            <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 1.5, bgcolor: "background.paper" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={800}>
                {item.label}
              </Typography>
              <Typography variant="body2" color="text.primary" fontWeight={700} mt={0.5}>
                {item.render ? item.render(item.value) : displayValue(item.value)}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </AppCard>
  );
}

function MediaSection({ record }: { record: AdminPropertyRecord }) {
  const images = record.media.images;
  const videos = record.media.videos;
  const documents = record.media.documents;

  if (!images.length && !videos.length && !documents.length) {
    return null;
  }

  return (
    <AppCard title="Media & Documents" subtitle="Images, videos, and uploaded property documents.">
      {images.length ? (
        <Grid container spacing={1.5} mb={2}>
          {images.map((image) => (
            <Grid item xs={12} sm={4} key={image.id}>
              {image.file?.url ? (
                <Box
                  component="img"
                  src={image.file.url}
                  alt={image.title ?? record.title}
                  sx={{ borderRadius: 3, border: 1, borderColor: "divider", height: 112, objectFit: "cover", width: "100%" }}
                />
              ) : (
                <Box
                  sx={{
                    alignItems: "center",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    display: "flex",
                    gap: 1,
                    minHeight: 112,
                    justifyContent: "center",
                  }}
                >
                  <ImageRoundedIcon color="primary" />
                  <Typography variant="body2" fontWeight={800}>
                    {image.title ?? image.file?.originalName ?? "Image"}
                  </Typography>
                </Box>
              )}
            </Grid>
          ))}
        </Grid>
      ) : null}
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {videos.map((video) => (
          <Chip
            key={video.id}
            icon={<ArticleRoundedIcon />}
            label={video.title ?? video.file?.originalName ?? "Video"}
            component={video.file?.url ? "a" : "div"}
            href={video.file?.url ?? undefined}
            target={video.file?.url ? "_blank" : undefined}
            clickable={Boolean(video.file?.url)}
            variant="outlined"
          />
        ))}
        {documents.map((document) => (
          <Chip
            key={document.id}
            icon={<ArticleRoundedIcon />}
            label={`${document.documentType}${document.isVerified ? " (Verified)" : ""}`}
            component={document.file?.url ? "a" : "div"}
            href={document.file?.url ?? undefined}
            target={document.file?.url ? "_blank" : undefined}
            clickable={Boolean(document.file?.url)}
            variant="outlined"
            color={document.isVerified ? "success" : "default"}
          />
        ))}
      </Stack>
    </AppCard>
  );
}

function TimelineSection({ history }: { history: PropertyStatusHistoryEntry[] }) {
  if (!history.length) {
    return null;
  }

  return (
    <AppCard title="Status Timeline" subtitle="Admin review actions and property status changes, newest first.">
      <Stack spacing={0}>
        {history.map((entry, index) => (
          <Stack direction="row" spacing={1.5} key={entry.id}>
            <Stack alignItems="center">
              <Box sx={{ bgcolor: "primary.main", borderRadius: 999, height: 12, mt: 0.5, width: 12 }} />
              {index < history.length - 1 ? <Box sx={{ bgcolor: "divider", flex: 1, my: 0.5, width: 2 }} /> : null}
            </Stack>
            <Box sx={{ pb: 2 }}>
              <Typography variant="body2" fontWeight={800}>
                {entry.oldStatus ? `${entry.oldStatus} → ${entry.newStatus}` : entry.newStatus}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {entry.createdAt ? new Date(entry.createdAt).toLocaleString("en-IN") : ""}
              </Typography>
              {entry.remarks ? (
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {entry.remarks}
                </Typography>
              ) : null}
            </Box>
          </Stack>
        ))}
      </Stack>
    </AppCard>
  );
}

export function PropertyDetailsPage() {
  const { id = "" } = useParams();
  const [record, setRecord] = useState<AdminPropertyRecord | null>(null);
  const [history, setHistory] = useState<PropertyStatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    Promise.all([propertyService.getPropertyById(id), propertyService.getStatusHistory(id)])
      .then(([propertyResponse, historyResponse]) => {
        setRecord(propertyResponse.data);
        setHistory(historyResponse.data ?? []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  if (!record || notFound) {
    return <EmptyState title="Property not found" description="The selected property could not be loaded." />;
  }

  return (
    <>
      <PageHeader title="Property Details" subtitle="Live data from the admin properties API, organized for admin review." />
      <Stack spacing={2.5}>
        <AppCard title={record.title} subtitle={record.id}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" color="primary.dark">
                {record.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.75}>
                {[record.location?.addressLine1, record.location?.area?.name, record.location?.city?.name].filter(Boolean).join(", ")}
              </Typography>
            </Box>
            <Stack alignItems={{ xs: "flex-start", md: "flex-end" }} spacing={1}>
              <StatusBadge value={record.status} />
              {record.isFeatured ? <Chip size="small" color="warning" label="Featured" /> : null}
              <Typography variant="h5">{currency(record.price)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {record.basic.propertyType?.name ?? ""} {record.basic.listingType?.name ? `• ${record.basic.listingType.name}` : ""}
              </Typography>
            </Stack>
          </Stack>
        </AppCard>

        <Grid container spacing={2.5}>
          <Grid item xs={12} xl={8}>
            <Stack spacing={2.5}>
              <DetailSection
                title="Basic Property Information"
                icon={<ApartmentRoundedIcon />}
                items={[
                  { label: "Property ID", value: record.id },
                  { label: "Property Title", value: record.title },
                  { label: "Property Type", value: record.basic.propertyType?.name },
                  { label: "Property Category", value: record.basic.category?.name },
                  { label: "Listing Type", value: record.basic.listingType?.name },
                  { label: "Status", value: record.status, render: (value) => <StatusBadge value={String(value)} /> },
                  { label: "Verification Status", value: record.verificationStatus, render: (value) => <StatusBadge value={String(value)} /> },
                  { label: "Created Date", value: record.createdAt, render: (value) => new Date(String(value)).toLocaleString("en-IN") },
                  { label: "Updated Date", value: record.updatedAt, render: (value) => new Date(String(value)).toLocaleString("en-IN") },
                  { label: "Published Date", value: record.publishedAt, render: (value) => new Date(String(value)).toLocaleString("en-IN") },
                ]}
              />

              <DetailSection
                title="Location Information"
                icon={<LocationOnRoundedIcon />}
                items={[
                  { label: "State", value: record.location?.state?.name },
                  { label: "City", value: record.location?.city?.name },
                  { label: "Area / Locality", value: record.location?.area?.name },
                  { label: "Address Line 1", value: record.location?.addressLine1 },
                  { label: "Address Line 2", value: record.location?.addressLine2 },
                  { label: "Landmark", value: record.location?.landmark },
                  { label: "Latitude", value: record.location?.latitude },
                  { label: "Longitude", value: record.location?.longitude },
                  { label: "Pin Code", value: record.location?.pincode },
                ]}
              />

              <DetailSection
                title="Size & Area Information"
                icon={<SquareFootRoundedIcon />}
                items={[
                  { label: "Carpet Area (sqft)", value: record.area.carpetAreaSqft },
                  { label: "Built-up Area (sqft)", value: record.area.builtUpAreaSqft },
                  { label: "Plot Area (sqft)", value: record.area.plotAreaSqft },
                ]}
              />

              <DetailSection
                title="Configuration"
                icon={<ApartmentRoundedIcon />}
                items={[
                  { label: "BHK", value: record.basic.bhk?.name },
                  { label: "Bedrooms", value: record.basic.bedrooms },
                  { label: "Bathrooms", value: record.basic.bathrooms },
                  { label: "Balconies", value: record.basic.balconies },
                  { label: "Parking", value: record.basic.parking },
                  { label: "Facing", value: record.basic.facing?.name },
                  { label: "Floor Number", value: record.basic.floorNumber },
                  { label: "Total Floors", value: record.basic.totalFloors },
                  { label: "Property Age (years)", value: record.basic.propertyAge },
                  { label: "Construction Quality", value: record.basic.constructionQuality?.name },
                ]}
              />

              <DetailSection
                title="Additional Details"
                subtitle="Property-type-specific fields submitted from the mobile add-property flow. Backend stores these as a free-form object with no fixed schema, so they are rendered generically here."
                icon={<SquareFootRoundedIcon />}
                items={Object.entries(record.basic.details ?? {}).map(([key, value]) => ({
                  label: humanizeKey(key),
                  value: value as unknown,
                }))}
              />

              <MediaSection record={record} />
            </Stack>
          </Grid>

          <Grid item xs={12} xl={4}>
            <Stack spacing={2.5}>
              <DetailSection
                title="Owner Information"
                icon={<PersonRoundedIcon />}
                items={[
                  { label: "Owner Name", value: record.ownerSummary?.fullName },
                  { label: "Owner Mobile", value: record.ownerSummary?.mobile },
                  { label: "Owner Email", value: record.ownerSummary?.email },
                  { label: "Owner Role", value: record.ownerSummary?.selectedRole },
                ]}
              />

              <DetailSection
                title="Broker / Agent Information"
                icon={<PersonRoundedIcon />}
                items={[
                  { label: "Broker Name", value: record.brokerSummary?.fullName },
                  { label: "Broker Mobile", value: record.brokerSummary?.mobile },
                  { label: "Broker Email", value: record.brokerSummary?.email },
                  { label: "Broker Role", value: record.brokerSummary?.selectedRole },
                ]}
              />

              <DetailSection
                title="Pricing Information"
                icon={<PaymentsRoundedIcon />}
                items={[{ label: "Price", value: record.price, render: currency }]}
              />

              <DetailSection
                title="Description & Amenities"
                icon={<ArticleRoundedIcon />}
                items={[
                  { label: "Full Description", value: record.description },
                  { label: "Amenities", value: record.amenities.map((amenity) => amenity.name) },
                ]}
              />

              <DetailSection
                title="Admin Review Section"
                icon={<RateReviewRoundedIcon />}
                items={[
                  { label: "Current Status", value: record.status, render: (value) => <StatusBadge value={String(value)} /> },
                  { label: "Verification Status", value: record.verificationStatus, render: (value) => <StatusBadge value={String(value)} /> },
                  { label: "Featured", value: record.isFeatured ? "Yes" : "No" },
                ]}
              />

              <TimelineSection history={history} />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}
