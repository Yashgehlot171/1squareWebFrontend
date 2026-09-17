export type ConstructionPlanStatus = "active" | "inactive" | "draft" | "published";
export type ConstructionSpecificationDataType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "BOOLEAN"
  | "DATE"
  | "SELECT"
  | "MULTISELECT"
  | "IMAGE"
  | "FILE"
  | "URL";

export interface ConstructionPlan {
  id: string;
  planName: string;
  planCode: string;
  shortDescription?: string;
  description?: string;
  pricePerSqFt: number;
  estimatedConstructionDays?: number;
  thumbnailFileId?: string | null;
  brochureFileId?: string | null;
  status: ConstructionPlanStatus;
  isRecommended: boolean;
  badge?: string | null;
  displayOrder: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ConstructionSpecificationCategory {
  id: string;
  categoryName: string;
  categoryCode: string;
  iconFileId?: string | null;
  displayOrder: number;
  status: "active" | "inactive";
}

export interface ConstructionSpecificationField {
  id: string;
  categoryId: string;
  fieldName: string;
  fieldCode: string;
  dataType: ConstructionSpecificationDataType;
  placeholder?: string | null;
  helpText?: string | null;
  defaultValue?: string | null;
  validationRules?: Record<string, unknown> | null;
  isRequired: boolean;
  displayOrder: number;
  status: "active" | "inactive";
  unit?: string | null;
  comparisonPriority?: number | null;
}

export interface ConstructionPlanSpecificationValue {
  id: string;
  constructionPlanId: string;
  specificationFieldId: string;
  value: string | number | boolean | string[] | null;
}

export interface ConstructionPlanDetail extends ConstructionPlan {
  specificationValues?: ConstructionPlanSpecificationValue[];
}

export type ConstructionPlanPayload = Omit<ConstructionPlan, "id" | "createdAt" | "updatedAt" | "deletedAt" | "createdBy" | "updatedBy">;
export type ConstructionSpecificationCategoryPayload = Omit<ConstructionSpecificationCategory, "id">;
export type ConstructionSpecificationFieldPayload = Omit<ConstructionSpecificationField, "id">;
export type ConstructionPlanSpecificationValuePayload = Omit<ConstructionPlanSpecificationValue, "id">;

export interface ConstructionPlanCompareResponse {
  plans: ConstructionPlan[];
  categories: Array<{
    categoryId: string;
    categoryName: string;
    fields: Array<{
      fieldId: string;
      fieldName: string;
      values: Record<string, ConstructionPlanSpecificationValue["value"]>;
    }>;
  }>;
}
