import api from "./api";

export async function getUserRecordings() {
  const res = await api.get("/audio/recordings");
  return res.data;
}

export async function getUserRecordingById(id: any) {
  const res = await api.get(`/audio/recordings/${id}`);
  return res.data;
}

export async function deleteUserRecordingById(id: any) {
  const res = await api.delete(`/audio/recordings/${id}`);
  return res.data;
}
