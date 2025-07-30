import axios from "axios";

export interface Release {
  id: string;
  title: string;
  status: "Published" | "Scheduled" | "Draft" | "Archived";
  version: string;
  lastUpdated: string;
}

export const fetchReleases = async (): Promise<Release[]> => {
  const response = await axios.get("/api/releases");
  return response.data;
};

export const deleteRelease = async (id: string): Promise<void> => {
  await axios.delete(`/api/releases/${id}`);
};

export const archiveRelease = async (id: string): Promise<void> => {
  await axios.patch(`/api/releases/${id}/archive`);
};
