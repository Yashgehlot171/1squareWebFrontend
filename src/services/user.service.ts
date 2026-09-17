import { usersMock } from "../mock-data/users.mock";
import type { UserRecord } from "../types";
import { buildResponse } from "./base";

export const userService = {
  async getUsers() {
    return buildResponse({ items: usersMock, total: usersMock.length }, "req_users_list");
  },

  async getUserById(id: string) {
    return buildResponse(usersMock.find((user) => user.id === id) ?? null, "req_user_detail");
  },

  async createUser(payload: UserRecord) {
    return buildResponse(payload, "req_user_create");
  },

  async updateUser(payload: UserRecord) {
    return buildResponse(payload, "req_user_update");
  },

  async deleteUser(id: string) {
    return buildResponse({ id }, "req_user_delete");
  },
};
