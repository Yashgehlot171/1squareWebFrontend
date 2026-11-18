import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";

/**
 * Loan-bank master, verified live against production
 * (http://3.109.54.6/api/v1) on 2026-09-18. NOT part of the generic
 * `/admin/masters/:type` family — see the doc comment on `apiEndpoints.adminLoans`
 * for the full contract rationale. Response shape read directly from
 * 1SqrPropertyBackend's `LoanBank` Prisma model
 * (prisma/schema.prisma) and `loanRepository.listBanks/createBank/updateBank`
 * (no `present()` transform on the backend — these are the raw model
 * columns). `id`/`logoFileId` are BigInt columns, serialized to strings by
 * the backend's `sendSuccess` (`JSON.stringify` replacer turns every bigint
 * into a string) — confirmed live (`"id":"3"`). `interestRate`/
 * `processingFee` are Prisma `Decimal` columns, which also serialize to
 * strings (confirmed live: `"interestRate":"9.5"`), so both are typed
 * `string | number | null` here and normalized with `Number(...)` by callers
 * that need to display or edit them.
 */
export interface BankApiItem {
  id: string;
  name: string;
  slug: string;
  logoFileId: string | null;
  interestRate: string | number | null;
  processingFee: string | number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface BankMutationInput {
  name?: string;
  logoFileId?: string | number | null;
  interestRate?: number | null;
  processingFee?: number | null;
  isActive?: boolean;
}

export const bankService = {
  /**
   * `GET /admin/loans/banks` returns a PLAIN ARRAY under `data` — confirmed
   * live 2026-09-18. This deliberately deviates from the canonical
   * `{ items, pagination }` list envelope documented in
   * docs/PROJECT_MASTER.md Section 5 (every other paginated admin list
   * endpoint follows it; this one does not paginate at all
   * (`loanRequestService.adminBanks()` -> `loanRepository.listBanks(...)`
   * with no `skip`/`take`) — reported, not silently normalized away, so a
   * future reader isn't misled into assuming pagination exists here.
   */
  async list(): Promise<BankApiItem[]> {
    const response = await apiRequest<BankApiItem[]>({
      url: apiEndpoints.adminLoans.banks,
      method: "GET",
    });
    return response.data;
  },

  async create(input: BankMutationInput): Promise<BankApiItem> {
    const response = await apiRequest<BankApiItem>({
      url: apiEndpoints.adminLoans.banks,
      method: "POST",
      data: input,
    });
    return response.data;
  },

  async update(id: string, input: BankMutationInput): Promise<BankApiItem> {
    const response = await apiRequest<BankApiItem>({
      url: apiEndpoints.adminLoans.bankById(id),
      method: "PATCH",
      data: input,
    });
    return response.data;
  },

  /**
   * `PATCH /admin/loans/banks/:bankId/status` — a real, dedicated
   * boolean-only status endpoint (`bankStatusSchema`), distinct from the
   * generic masters router's string "active"/"inactive" `/status` endpoint.
   * Confirmed live 2026-09-18.
   */
  async updateStatus(id: string, isActive: boolean): Promise<BankApiItem> {
    const response = await apiRequest<BankApiItem>({
      url: apiEndpoints.adminLoans.bankStatus(id),
      method: "PATCH",
      data: { isActive },
    });
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await apiRequest<{ deleted: boolean }>({
      url: apiEndpoints.adminLoans.bankById(id),
      method: "DELETE",
    });
  },
};
