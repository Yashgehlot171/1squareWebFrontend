import {apiRequest} from "./api/request";
import {apiEndpoints} from "./api/endpoints";

export interface AdminPropertyLeadConfig {
  isActive: boolean;
  buyerLeadPrice: string | null;
  currency: string;
  maxBrokerPurchases: number | null;
  updatedAt: string | null;
  updatedBy: string | null;
}
export interface UpdateAdminPropertyLeadConfig {
  isActive: boolean;
  buyerLeadPrice: string;
  maxBrokerPurchases: number;
}
export interface AdminLeadPurchase {
  id: string;
  requirementId: string;
  requirement: {propertyType: string | null; city: string | null; snapshot: Record<string, unknown> | null};
  broker: {id: string; name: string; companyName: string | null};
  price: string;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  paymentReference: string | null;
  orderReference: string | null;
  gatewayProvider: string | null;
  createdAt: string;
  purchasedAt: string | null;
}
interface PurchasePage {items: AdminLeadPurchase[]; pagination: {page:number;limit:number;total:number;totalPages:number}}

export const propertyLeadPurchaseAdminService = {
  async getConfig() {
    return (await apiRequest<AdminPropertyLeadConfig>({url: apiEndpoints.adminPropertyLeads.config, method: "GET"})).data;
  },
  async updateConfig(input: UpdateAdminPropertyLeadConfig) {
    return (await apiRequest<AdminPropertyLeadConfig>({url: apiEndpoints.adminPropertyLeads.config, method: "PATCH", data: input})).data;
  },
  async getPurchases(params: {page?: number; limit?: number; status?: string} = {}) {
    return (await apiRequest<PurchasePage>({url: apiEndpoints.adminPropertyLeads.purchases, method: "GET", params})).data;
  },
};
