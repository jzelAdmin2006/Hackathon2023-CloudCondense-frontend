const BASE_URL = "https://hackathon2023-cloudcondense.onrender.com";

export interface Metric {
  savedDiskSpace: number;
}

export interface GlobalConfig {
  scheduleRate: number;
  condenseAge: number;
}

interface CloudStorage {
  id?: number;
  name: string;
  type: string;
  url: string;
  username: string;
  password?: string;
}

export interface StorageType {
  designation: string;
  requiresUrl: boolean;
}

export async function getAllCloudStorages(): Promise<CloudStorage[]> {
  return request("/cloud-storage");
}

export async function addCloudStorage(
  storage: CloudStorage
): Promise<CloudStorage> {
  return request("/cloud-storage", {
    method: "POST",
    body: JSON.stringify(storage),
  });
}

export async function getCloudStorageTypes(): Promise<StorageType[]> {
  return request("/cloud-storage/types");
}

export async function deleteCloudStorage(id: number): Promise<void> {
  return request(`/cloud-storage/${id}`, {
    method: "DELETE",
  });
}

export async function triggerCondense(id: number): Promise<void> {
  return request(`/cloud-storage/${id}/condense`, {
    method: "POST",
  });
}

export async function updateGlobalConfig(
  config: Record<string, any>
): Promise<void> {
  return request("/global-config", {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

export async function getGlobalConfig(): Promise<GlobalConfig> {
  return request("/global-config");
}

export async function getMetric(): Promise<Metric> {
  return request("/metric");
}

async function request(url: string, options: RequestInit = {}): Promise<any> {
  const headers = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };

  const response = await fetch(BASE_URL + url, {
    ...options,
    headers: {
      ...options.headers,
      ...headers,
    },
  });

  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Server error: ${await response.text()}`);
  }
}
