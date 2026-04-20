import { api } from "../api/client";

export async function listPosts(params = {}) {
  const { signal, ...query } = params;
  const res = await api.get("/posts", { params: query, signal });
  return res.data;
}

export async function getPostBySlug(slug) {
  const res = await api.get(`/posts/${encodeURIComponent(slug)}`);
  return res.data;
}

export async function getRelatedForSlug(slug) {
  const res = await api.get(`/posts/related/${encodeURIComponent(slug)}`);
  return res.data;
}

export async function getTopViewedPost() {
  const res = await api.get("/posts/stats/top-viewed");
  return res.data;
}

export async function listPublishedTags(params = {}) {
  const { signal, ...query } = params;
  const res = await api.get("/posts/meta/tags", { params: query, signal });
  return res.data;
}
