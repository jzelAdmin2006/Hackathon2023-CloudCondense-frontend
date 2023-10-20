const BASE_URL = "http://localhost:8080";

interface CloudStorage {
  id?: number;
  name: string;
  type: string;
  username: string;
  password?: string;
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

export async function getCloudStorageTypes(): Promise<string[]> {
  return request("/cloud-storage/types");
}

export async function deleteCloudStorage(id: number): Promise<void> {
  return request(`/cloud-storage/${id}`, {
    method: "DELETE",
  });
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
