import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";
import type {
  ConstructionPlan,
  ConstructionPlanCompareResponse,
  ConstructionPlanDetail,
  ConstructionPlanPayload,
  ConstructionPlanSpecificationValue,
  ConstructionPlanSpecificationValuePayload,
  ConstructionSpecificationCategory,
  ConstructionSpecificationCategoryPayload,
  ConstructionSpecificationField,
  ConstructionSpecificationFieldPayload,
} from "../types/constructionPlanMaster";

interface ListResponse<T> {
  items: T[];
  total: number;
}

const withId = (baseUrl: string, id: string) => `${baseUrl}/${id}`;

export const constructionPlanMasterService = {
  getPlans() {
    return apiRequest<ListResponse<ConstructionPlan>>({
      url: apiEndpoints.constructionPlanMaster.plans,
      method: "GET",
    });
  },

  getPlanById(id: string) {
    return apiRequest<ConstructionPlanDetail>({
      url: withId(apiEndpoints.constructionPlanMaster.plans, id),
      method: "GET",
    });
  },

  createPlan(payload: ConstructionPlanPayload) {
    return apiRequest<ConstructionPlan>({
      url: apiEndpoints.constructionPlanMaster.plans,
      method: "POST",
      data: payload,
    });
  },

  updatePlan(id: string, payload: Partial<ConstructionPlanPayload>) {
    return apiRequest<ConstructionPlan>({
      url: withId(apiEndpoints.constructionPlanMaster.plans, id),
      method: "PATCH",
      data: payload,
    });
  },

  deletePlan(id: string) {
    return apiRequest<{ id: string }>({
      url: withId(apiEndpoints.constructionPlanMaster.plans, id),
      method: "DELETE",
    });
  },

  getCategories() {
    return apiRequest<ListResponse<ConstructionSpecificationCategory>>({
      url: apiEndpoints.constructionPlanMaster.categories,
      method: "GET",
    });
  },

  createCategory(payload: ConstructionSpecificationCategoryPayload) {
    return apiRequest<ConstructionSpecificationCategory>({
      url: apiEndpoints.constructionPlanMaster.categories,
      method: "POST",
      data: payload,
    });
  },

  updateCategory(id: string, payload: Partial<ConstructionSpecificationCategoryPayload>) {
    return apiRequest<ConstructionSpecificationCategory>({
      url: withId(apiEndpoints.constructionPlanMaster.categories, id),
      method: "PATCH",
      data: payload,
    });
  },

  deleteCategory(id: string) {
    return apiRequest<{ id: string }>({
      url: withId(apiEndpoints.constructionPlanMaster.categories, id),
      method: "DELETE",
    });
  },

  getFields(categoryId?: string) {
    return apiRequest<ListResponse<ConstructionSpecificationField>>({
      url: apiEndpoints.constructionPlanMaster.fields,
      method: "GET",
      params: categoryId ? { categoryId } : undefined,
    });
  },

  createField(payload: ConstructionSpecificationFieldPayload) {
    return apiRequest<ConstructionSpecificationField>({
      url: apiEndpoints.constructionPlanMaster.fields,
      method: "POST",
      data: payload,
    });
  },

  updateField(id: string, payload: Partial<ConstructionSpecificationFieldPayload>) {
    return apiRequest<ConstructionSpecificationField>({
      url: withId(apiEndpoints.constructionPlanMaster.fields, id),
      method: "PATCH",
      data: payload,
    });
  },

  deleteField(id: string) {
    return apiRequest<{ id: string }>({
      url: withId(apiEndpoints.constructionPlanMaster.fields, id),
      method: "DELETE",
    });
  },

  getValues(constructionPlanId?: string) {
    return apiRequest<ListResponse<ConstructionPlanSpecificationValue>>({
      url: apiEndpoints.constructionPlanMaster.values,
      method: "GET",
      params: constructionPlanId ? { constructionPlanId } : undefined,
    });
  },

  upsertValue(payload: ConstructionPlanSpecificationValuePayload) {
    return apiRequest<ConstructionPlanSpecificationValue>({
      url: apiEndpoints.constructionPlanMaster.values,
      method: "POST",
      data: payload,
    });
  },

  updateValue(id: string, payload: Partial<ConstructionPlanSpecificationValuePayload>) {
    return apiRequest<ConstructionPlanSpecificationValue>({
      url: withId(apiEndpoints.constructionPlanMaster.values, id),
      method: "PATCH",
      data: payload,
    });
  },

  deleteValue(id: string) {
    return apiRequest<{ id: string }>({
      url: withId(apiEndpoints.constructionPlanMaster.values, id),
      method: "DELETE",
    });
  },

  compare(planIds: string[]) {
    return apiRequest<ConstructionPlanCompareResponse>({
      url: apiEndpoints.constructionPlanMaster.compare,
      method: "GET",
      params: { planIds: planIds.join(",") },
    });
  },
};
