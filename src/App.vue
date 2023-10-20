<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  addCloudStorage,
  deleteCloudStorage,
  getAllCloudStorages,
  getCloudStorageTypes,
} from "./api/requests.ts";

export default defineComponent({
  name: "App",
  setup() {
    const storages = ref<any[]>([]);
    const newStorage = ref({
      name: "",
      type: "",
      username: "",
      password: "",
    });
    const storageTypes = ref<string[]>([]);

    const fetchStorages = async () => {
      storages.value = await getAllCloudStorages();
    };

    fetchStorages();

    const addNewStorage = async () => {
      await addCloudStorage(newStorage.value);
      fetchStorages();
    };

    const fetchStorageTypes = async () => {
      storageTypes.value = await getCloudStorageTypes();
    };

    fetchStorageTypes();

    const deleteStorage = async (id: number) => {
      try {
        await deleteCloudStorage(id);
        fetchStorages();
      } catch (error) {
        console.error("Deletion failed:", error);
      }
    };

    return { storages, storageTypes, newStorage, addNewStorage, deleteStorage };
  },
});
</script>

<template>
  <div id="app">
    <h1>
      <img src="/logo.png" alt="CloudCondense Logo" class="logo" />
      CloudCondense
    </h1>

    <div class="content">
      <div class="form-section">
        <div class="form-group">
          <h2>Add New Storage</h2>
          <div class="input-group">
            <input v-model="newStorage.name" placeholder="Name" />
            <select v-model="newStorage.type">
              <option v-for="type in storageTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
            <input v-model="newStorage.username" placeholder="Username" />
            <input v-model="newStorage.password" placeholder="Password" />
            <button @click="addNewStorage">Add</button>
          </div>
        </div>
      </div>

      <div class="table-section">
        <h2>Cloud Storages</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="storage in storages" :key="storage.id">
              <td>{{ storage.name }}</td>
              <td>{{ storage.type }}</td>
              <td>{{ storage.username }}</td>
              <td>
                <button @click="() => deleteStorage(storage.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
