import { api } from "../api/client";

export async function login(body) {
  const res = await api.post("/auth/login", body);
  return res.data;
}

export async function register(body) {
  const res = await api.post("/auth/register", body);
  return res.data;
}

export async function forgotPassword(body) {
  const res = await api.post("/auth/forgot-password", body);
  return res.data;
}

export async function resetPassword(body) {
  const res = await api.post("/auth/reset-password", body);
  return res.data;
}

export async function fetchMe() {
  const res = await api.get("/auth/me");
  return res.data;
}
