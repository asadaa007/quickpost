import { api } from "../api/client";

export async function listCategories() {
  const res = await api.get("/categories");
  return res.data;
}
