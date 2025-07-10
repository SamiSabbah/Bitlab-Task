import api from "./api";

export async function register(email: string, password: string) {
  const res = await api.post("/auth/register", { email, password });
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function refresh() {
  const res = await api.post("/auth/refresh");
  return res.data;
}

export async function logout() {
  const res = await api.post("/auth/logout");
  return res.data;
}
