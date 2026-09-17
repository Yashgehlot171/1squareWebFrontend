import { rolesMock } from "../mock-data/roles.mock";
import type { RoleDefinition } from "../types";
import { buildResponse } from "./base";

export const roleService = {
  async getRoles() {
    return buildResponse({ items: rolesMock, total: rolesMock.length }, "req_role_list");
  },

  async getRoleById(id: string) {
    return buildResponse(rolesMock.find((role) => role.id === id) ?? null, "req_role_detail");
  },

  async saveRole(role: RoleDefinition) {
    return buildResponse(role, "req_role_save");
  },
};
