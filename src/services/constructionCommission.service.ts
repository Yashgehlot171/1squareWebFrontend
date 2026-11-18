import {apiRequest} from "./api/request";

export interface ConstructionCommissionConfig {enabled: boolean; rate: string; maximumRate: string; updatedAt?: string | null}
export interface ConstructionCommissionConfigHistory {id: string; oldEnabled: boolean; newEnabled: boolean; oldRate: string; newRate: string; changedAt: string; changedBy: string}
export interface ConstructionCommissionRow {
  id: string; projectId: string; projectNo: string; projectStatus: string; agreementNo: string | null; agreementAmount: string;
  builder: {id: string; name: string; mobile: string | null; email: string | null}; rateSnapshot: string; baseCommission: string;
  accruedCommission: string; settledCommission: string; outstandingCommission: string; builderCredit: string; commissionAdjustmentsTotal: string; status: string; triggeredAt: string;
  adjustments: {id: string; changeOrderNo: number; title: string; baseAmountDelta: string; commissionDelta: string; createdAt: string}[];
  payments: {id: string; amount: string; reference: string | null; note: string | null; paidAt: string; recordedBy: string}[];
}
export interface ConstructionCommissionSummary {projects: number; accruedCommission: string; settledCommission: string; outstandingCommission: string; builderCredit: string}

const base = "/admin/construction";
export const constructionCommissionAdminService = {
  async getConfig() {return (await apiRequest<ConstructionCommissionConfig>({url: `${base}/commission-settings`, method: "GET"})).data;},
  async updateConfig(input: {enabled: boolean; rate: string}) {return (await apiRequest<ConstructionCommissionConfig>({url: `${base}/commission-settings`, method: "PATCH", data: input})).data;},
  async getConfigHistory() {return (await apiRequest<ConstructionCommissionConfigHistory[]>({url: `${base}/commission-settings/history`, method: "GET"})).data;},
  async getSummary() {return (await apiRequest<ConstructionCommissionSummary>({url: `${base}/commissions/summary`, method: "GET"})).data;},
  async list(status?: string) {return (await apiRequest<ConstructionCommissionRow[]>({url: `${base}/commissions`, method: "GET", params: status ? {status} : undefined})).data;},
  async detail(id: string) {return (await apiRequest<ConstructionCommissionRow>({url: `${base}/commissions/${id}`, method: "GET"})).data;},
  async recordPayment(id: string, input: {amount: string; reference?: string; note?: string}) {return (await apiRequest<ConstructionCommissionRow>({url: `${base}/commissions/${id}/payments`, method: "POST", data: input})).data;},
};
