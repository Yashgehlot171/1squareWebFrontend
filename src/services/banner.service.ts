import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";

/**
 * Banner, verified live against production (http://3.109.54.6/api/v1) on
 * 2026-09-18. NOT part of the generic `/admin/masters/:type` family — see the
 * doc comment on `apiEndpoints.adminBanners` for the full contract rationale.
 * Response shape read directly from `present()` in
 * 1SqrPropertyBackend/src/services/banner.service.ts, and confirmed live.
 * `id`/`imageFileId` are BigInt columns, serialized to strings by the
 * backend (confirmed live: `"id":"2"`).
 */
export interface BannerTypeRef {
  id: number;
  name: string;
  slug: string;
}

export interface BannerApiItem {
  id: string;
  title: string;
  subtitle: string | null;
  bannerTypeId: number | null;
  bannerType: BannerTypeRef | null;
  imageFileId: string | null;
  imageUrl: string | null;
  redirectUrl: string | null;
  redirectType: string | null;
  redirectValue: string | null;
  startDate: string | null;
  endDate: string | null;
  sortOrder: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface BannerMutationInput {
  title?: string;
  subtitle?: string | null;
  bannerTypeId?: number;
  imageFileId?: string | number | null;
  redirectUrl?: string | null;
  redirectType?: string | null;
  redirectValue?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  sortOrder?: number;
  status?: "active" | "inactive";
}

interface BannerListEnvelope {
  items: BannerApiItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const bannerService = {
  /**
   * `GET /admin/banners` follows the canonical `{ items, pagination }`
   * envelope (unlike Banks' `/admin/loans/banks`) — confirmed live
   * 2026-09-18.
   */
  async list(): Promise<BannerApiItem[]> {
    const response = await apiRequest<BannerListEnvelope>({
      url: apiEndpoints.adminBanners.base,
      method: "GET",
      params: { limit: 100 },
    });
    return response.data.items;
  },

  async create(input: BannerMutationInput): Promise<BannerApiItem> {
    const response = await apiRequest<BannerApiItem>({
      url: apiEndpoints.adminBanners.base,
      method: "POST",
      data: input,
    });
    return response.data;
  },

  /**
   * `PATCH /admin/banners/:bannerId` — live-verified 2026-09-18 as the first
   * exercise of this endpoint since the backend's params-inheritance bug fix
   * (previously affected the generic masters router's plain update endpoint;
   * banner's update params schema was independently confirmed standalone and
   * unaffected). Create -> edit -> a fresh, separate GET re-fetch all
   * confirmed the edit persisted server-side.
   */
  async update(id: string, input: BannerMutationInput): Promise<BannerApiItem> {
    const response = await apiRequest<BannerApiItem>({
      url: apiEndpoints.adminBanners.byId(id),
      method: "PATCH",
      data: input,
    });
    return response.data;
  },

  /**
   * `PATCH /admin/banners/:bannerId/status` — a dedicated status-toggle
   * endpoint (string "active"/"inactive", not a boolean like Banks).
   * Confirmed live 2026-09-18.
   */
  async updateStatus(id: string, status: "active" | "inactive"): Promise<BannerApiItem> {
    const response = await apiRequest<BannerApiItem>({
      url: apiEndpoints.adminBanners.status(id),
      method: "PATCH",
      data: { status },
    });
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await apiRequest<{ deleted: boolean }>({
      url: apiEndpoints.adminBanners.byId(id),
      method: "DELETE",
    });
  },
};
