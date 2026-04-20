import { api } from "../api/client";

export async function listPostsAdmin(params) {
  const res = await api.get("/posts/admin/all", { params });
  return res.data;
}

export async function getPostAdminById(id) {
  const res = await api.get(`/posts/admin/post/${id}`);
  return res.data;
}

export async function createPost(payload) {
  const res = await api.post("/posts", payload);
  return res.data;
}

export async function updatePost(id, payload) {
  const res = await api.put(`/posts/${id}`, payload);
  return res.data;
}

export async function deletePost(id) {
  await api.delete(`/posts/${id}`);
}

export async function createCategory(body) {
  const res = await api.post("/categories", body);
  return res.data;
}

export async function deleteCategory(id) {
  await api.delete(`/categories/${id}`);
}
