<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  addCloudStorage,
  deleteCloudStorage,
  getAllCloudStorages,
  getCloudStorageTypes,
  triggerCondense,
  StorageType,
} from "./api/requests.ts";

export default defineComponent({
  name: "App",
  methods: { triggerCondense },
  setup() {
    const storages = ref<any[]>([]);
    const newStorage = ref({
      name: "",
      type: {
        designation: "",
        requiresUrl: false,
      },
      url: "",
      username: "",
      password: "",
    });
    const storageTypes = ref<StorageType[]>([]);

    const fetchStorages = async () => {
      storages.value = await getAllCloudStorages();
    };

    fetchStorages();

    const addNewStorage = async () => {
      await addCloudStorage({
        name: newStorage.value.name,
        type: newStorage.value.type.designation,
        url: newStorage.value.url,
        username: newStorage.value.username,
        password: newStorage.value.password,
      });
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

    const condenseStorage = async (id: number) => {
      try {
        await triggerCondense(id);
      } catch (error) {
        console.error("Condense failed:", error);
      }
    };

    return {
      storages,
      storageTypes,
      newStorage,
      addNewStorage,
      deleteStorage,
      condenseStorage,
    };
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
              <option
                v-for="type in storageTypes"
                :key="type.designation"
                :value="type"
              >
                {{ type.designation }}
              </option>
            </select>
            <input
              v-if="newStorage.type.requiresUrl"
              v-model="newStorage.url"
              placeholder="URL (http://example.com)"
            />
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
              <td>{{ storage.type.designation }}</td>
              <td>{{ storage.username }}</td>
              <td>
                <button @click="() => deleteStorage(storage.id)">Delete</button>
              </td>
              <td>
                <button @click="() => condenseStorage(storage.id)">
                  Condense
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
