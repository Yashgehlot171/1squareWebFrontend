import {apiEndpoints} from "./api/endpoints";
import {apiRequest} from "./api/request";

export type ConstructionCapabilityStatus = "ACTIVE" | "NOT_ENABLED" | "SUSPENDED";
export interface BuilderProviderInput {
  name: string;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
  cityId: number;
  areaId?: number | null;
  serviceAreaIds?: number[];
  experienceYears?: number | null;
}
export interface AdminBuilder {
  id: string | number;
  fullName?: string | null;
  email?: string | null;
  mobile?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  capabilityStatus: ConstructionCapabilityStatus;
  brokerProfile: {
    companyName?: string | null;
    bio?: string | null;
    gstNumber?: string | null;
    reraRegistrationNo?: string | null;
    officeAddress?: string | null;
    experienceYears?: number | null;
    verificationStatus: string;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    verifiedAt?: string | null;
    officeCity?: {id: number; name: string; stateId?: number} | null;
    documents?: {id: string | number; label?: string | null; file: {originalName: string; fileType: string; status: string}}[];
  } | null;
  constructionProviderProfile: {
    id: string | number;
    name: string;
    serviceType: string;
    mobile?: string | null;
    email?: string | null;
    address?: string | null;
    cityId?: number | null;
    areaId?: number | null;
    serviceAreas?: {area: {id: number; name: string; cityId: number}}[];
    city?: {id: number; name: string; stateId?: number} | null;
    area?: {id: number; name: string; cityId: number} | null;
    experienceYears?: number | null;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    builderConstructionPlans: BuilderPlan[];
    constructionProjects: {id: string | number; projectNo: string; status: string; showcaseConsent: {enabled: boolean; allowedAt?: string | null; revokedAt?: string | null} | null; handover: {status: string; completedAt?: string | null} | null}[];
    builderPortfolioItems: {id: string | number; title: string; description?: string | null; cityName?: string | null; projectType?: string | null; completedAt?: string | null; media: {file: {id: string | number; originalName: string}}[]}[];
  } | null;
  customerReviews?: {averageRating: number | null; verifiedReviewCount: number; reviews: {id: string; rating: number; reviewText?: string | null; createdAt: string}[]} | null;
}
export interface BuilderPlanContent {
  name?: string;
  description?: string;
  pricingBasis?: string;
  indicativeRatePerSqFt?: number | null;
  specifications?: {category: string; data: Record<string, unknown>}[];
  upgrades?: {name: string; description?: string; pricingType?: string; price?: number | null}[];
  inclusions?: string[];
  exclusions?: string[];
  warranty?: {duration?: number | null; unit?: string | null; description?: string};
  timeline?: {duration?: number | null; unit?: string | null; notes?: string};
  paymentSchedule?: {type: string; milestones: {name: string; percentage?: number | null; sequence: number; description?: string}[]} | null;
  terms?: string;
  additionalNotes?: string;
}
export interface BuilderPlanVersion {
  id: string | number;
  version: number;
  status: string;
  content: BuilderPlanContent;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | number | null;
  reviewComment?: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface BuilderPlan {
  id: string | number;
  name: string;
  status: string;
  currentVersion: number;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewComment?: string | null;
  updatedAt: string;
  versions: BuilderPlanVersion[];
}
export type AdminPlanReview = BuilderPlanVersion & {plan: BuilderPlan & {provider: {id: string | number; name: string; serviceType: string; isActive: boolean; isVerified: boolean; cityId?: number | null; user: Pick<AdminBuilder, "id" | "fullName" | "mobile" | "email" | "status" | "brokerProfile"> | null}}};
export interface PageResult<T> {items: T[]; pagination: {page: number; limit: number; total: number; totalPages: number}}
export interface ConstructionDashboardSummary {approvedBuilders: number; suspendedBuilders: number; pendingPlanApprovals: number; approvedPlanVersions: number}
export interface ConstructionRfqSummary {totalRfqs: number; openRfqs: number; builderInterest: number; awaiting: number; withClarifications: number; withSiteVisits: number}
export interface ConstructionRfq {
  id: string | number; requestNo: string; customer: {id: string | number; name: string};
  location: {locality?: string | null; city?: string | null; state?: string | null; address?: string | null; landmark?: string | null};
  plotAreaSqFt?: number | string | null; floorCount: number; rfqStatus: string; displayStatus: string; createdAt: string; lastActivityAt?: string | null;
  invitationCounts: {invited: number; awaiting: number; viewed: number; interested: number; declined: number; clarificationRequested: number; siteVisitRequested: number; currentStatus: Record<string, number>};
  requirement?: {available: boolean; plot: Record<string, unknown>; floors: Record<string, unknown>[]; areaSummary: Record<string, unknown>; preferences: Record<string, unknown>};
  invitations?: {id: string | number; builder: {providerId: string | number; userId?: string | number; providerName: string; firmName?: string | null; brokerName?: string | null; city?: string | null}; status: string; sentAt: string; viewedAt?: string | null; respondedAt?: string | null; declinedAt?: string | null; declineReason?: string | null; clarifications: {id: string | number; question: string; status: string; createdAt: string; updatedAt: string}[]; siteVisitRequest?: {preferredDate?: string | null; timeSlot?: string | null; note?: string | null; status: string; createdAt: string; updatedAt: string} | null}[];
  timeline?: {type: string; description: string; createdAt: string}[];
}
export interface ConstructionRfqListItem extends ConstructionRfq {requirement?: undefined; invitations?: undefined; timeline?: undefined}
export interface AdminConstructionProject {
  id: string; projectNo: string; status: string; createdAt: string;
  customer: {name?: string}; builder: {name?: string}; requirement: Record<string, any>;
  commercial: Record<string, any>; source: {requestId: string; requestNo: string; invitationId: string; quoteId: string; quoteNo?: string | null; quoteVersionId: string; quoteVersion: number};
  agreement: null | {agreementNo: string; status: string; amount: string; customerAcceptedAt?: string | null; builderAcceptedAt?: string | null; acceptedAt?: string | null};
}
export interface AdminConstructionProgress {projectId: string; projectNo: string; projectStatus: string; actualStartDate?: string | null; overallProgress: number; plan: null | {status: string; revision: number; milestones: {id: string; sequence: number; title: string; status: string; progressPercentage: number; plannedStartDate?: string | null; plannedEndDate?: string | null; completedAt?: string | null; delayed: boolean; updates: {id: string; updateDate: string; progressPercentage: number; workCompleted: string; issues?: string | null; createdAt: string}[]}[]}}
export interface AdminConstructionPayments {projectId: string; contractAmount: string; verifiedPaid: string; pendingVerification: string; outstanding: string; stages: {id: string; sequence: number; title: string; percentage: string; amount: string; verifiedPaid: string; pendingVerification: string; remaining: string; status: string; payments: {id: string; amount: string; paymentDate: string; method: string; referenceNo?: string | null; status: string; rejectionReason?: string | null; proof?: {id: string; name?: string | null} | null}[]}[]}
export interface AdminConstructionChangeOrders {projectId: string; originalContractAmount: string; acceptedChangeOrdersTotal: string; currentRevisedContractAmount: string; acceptedDaysDelta: number; items: {id: string; sequenceNumber: number; initiatedBy: 'CUSTOMER' | 'BUILDER'; title: string; description: string; reason: string; status: string; proposedAmountDelta: string | null; proposedDaysDelta: number | null; finalAmountDelta: string | null; finalDaysDelta: number | null; createdAt: string; proposedAt: string | null; customerDecisionAt: string | null}[]}
export interface AdminConstructionHandover {projectId: string; projectNo: string; projectStatus: string; originalContractAmount: string; acceptedChangeOrdersTotal: string; revisedContractAmount: string; verifiedPaid: string; pendingVerification: string; outstanding: string; overallProgress: number; verifiedProjectEligible: boolean; handover: null | {status: string; builderCompletionNote: string; builderRequestedAt: string; customerDecisionNote: string | null; customerAcceptedAt: string | null; completedAt: string | null; issues: {id: string; title: string; description: string; status: string; reportedAt: string; resolvedAt: string | null; resolutionNote: string | null}[]; history: {type: string; status: string | null; note: string | null; createdAt: string}[]}}
export interface AdminConstructionCustomerReview {projectId: string; review: null | {id: string; rating: number; workQualityRating: number | null; communicationRating: number | null; timelinessRating: number | null; valueForMoneyRating: number | null; reviewText: string | null; createdAt: string; updatedAt: string; verified: boolean; customerReference: string; builderName: string}}

export const adminConstructionService = {
  async listProjects() {return (await apiRequest<AdminConstructionProject[]>({url: apiEndpoints.adminConstruction.projects, method: "GET"})).data;},
  async getProject(id: string) {return (await apiRequest<AdminConstructionProject>({url: apiEndpoints.adminConstruction.project(id), method: "GET"})).data;},
  async getProjectMilestones(id: string) {return (await apiRequest<AdminConstructionProgress>({url: apiEndpoints.adminConstruction.projectMilestones(id), method: "GET"})).data;},
  async getProjectPayments(id: string) {return (await apiRequest<AdminConstructionPayments>({url: apiEndpoints.adminConstruction.projectPayments(id), method: "GET"})).data;},
  async getProjectChangeOrders(id: string) {return (await apiRequest<AdminConstructionChangeOrders>({url: apiEndpoints.adminConstruction.projectChangeOrders(id), method: "GET"})).data;},
  async getProjectHandover(id: string) {return (await apiRequest<AdminConstructionHandover>({url: apiEndpoints.adminConstruction.projectHandover(id), method: "GET"})).data;},
  async getProjectReview(id: string) {return (await apiRequest<AdminConstructionCustomerReview>({url: apiEndpoints.adminConstruction.projectReview(id), method: "GET"})).data;},
  async getProjectPaymentProof(id: string, paymentId: string) {return (await apiRequest<{url?: string | null}>({url: apiEndpoints.adminConstruction.projectPaymentProof(id, paymentId), method: "GET"})).data;},
  async getRfqSummary() {
    return (await apiRequest<ConstructionRfqSummary>({url: apiEndpoints.adminConstruction.rfqSummary, method: "GET"})).data;
  },
  async listRfqs(params: {search?: string; status?: string; invitationStatus?: string; cityId?: number; createdFrom?: string; createdTo?: string; page?: number; limit?: number}) {
    return (await apiRequest<PageResult<ConstructionRfqListItem>>({url: apiEndpoints.adminConstruction.rfqs, method: "GET", params})).data;
  },
  async getRfq(id: string) {
    return (await apiRequest<ConstructionRfq>({url: apiEndpoints.adminConstruction.rfq(id), method: "GET"})).data;
  },
  async listBuilders(params: {search?: string; status?: string; page?: number; limit?: number}) {
    return (await apiRequest<PageResult<AdminBuilder>>({url: apiEndpoints.adminConstruction.builders, method: "GET", params})).data;
  },
  async getBuilder(userId: string) {
    return (await apiRequest<AdminBuilder>({url: apiEndpoints.adminConstruction.builder(userId), method: "GET"})).data;
  },
  async setCapability(userId: string, active: boolean, provider?: BuilderProviderInput) {
    return (await apiRequest<AdminBuilder>({url: apiEndpoints.adminConstruction.builderCapability(userId), method: "PATCH", data: {active, ...(provider ? {provider} : {})}})).data;
  },
  async getSummary() {
    return (await apiRequest<ConstructionDashboardSummary>({url: apiEndpoints.adminConstruction.dashboardSummary, method: "GET"})).data;
  },
  async listPlanApprovals(params: {status?: string; search?: string; builderId?: string; cityId?: number; submittedFrom?: string; submittedTo?: string; page?: number; limit?: number}) {
    return (await apiRequest<PageResult<AdminPlanReview>>({url: apiEndpoints.adminConstruction.planApprovals, method: "GET", params})).data;
  },
  async getPlanVersion(versionId: string) {
    return (await apiRequest<AdminPlanReview>({url: apiEndpoints.adminConstruction.planVersion(versionId), method: "GET"})).data;
  },
  async reviewPlan(versionId: string, decision: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED", comment?: string) {
    return (await apiRequest<AdminPlanReview>({url: apiEndpoints.adminConstruction.planReview(versionId), method: "PATCH", data: {decision, comment}})).data;
  },
};
