<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import {
  addCloudStorage,
  deleteCloudStorage,
  getAllCloudStorages,
  getCloudStorageTypes,
  triggerCondense,
  StorageType,
  updateGlobalConfig,
  getGlobalConfig,
  GlobalConfig,
} from "./api/requests.ts";

export default defineComponent({
  name: "App",
  methods: {
    triggerCondense,
    blockNonNumeric(event: KeyboardEvent) {
      if (
        ![
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          ".",
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
        ].includes(event.key)
      ) {
        event.preventDefault();
      }
    },
  },
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
    const condenseConfig = computed<GlobalConfig>(() => ({
      scheduleRate:
        selectedTimeValueScheduleRate.value *
        selectedTimeUnitScheduleRate.value.multiplier,
      condenseAge:
        selectedTimeValueCondenseAge.value *
        selectedTimeUnitCondenseAge.value.multiplier,
    }));

    const fetchStorages = async () => {
      storages.value = await getAllCloudStorages();
    };

    fetchStorages();

    const addNewStorage = async () => {
      await addCloudStorage({
        name: newStorage.value.name,
        type: newStorage.value.type.designation,
        url: newStorage.value.type.requiresUrl ? newStorage.value.url : "",
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

    const fetchCondenseConfig = async () => {
      try {
        const config = await getGlobalConfig();
        selectedTimeValueScheduleRate.value =
          config.scheduleRate / selectedTimeUnitScheduleRate.value.multiplier;
        selectedTimeValueCondenseAge.value =
          config.condenseAge / selectedTimeUnitCondenseAge.value.multiplier;
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    const updateCondenseConfig = async () => {
      try {
        await updateGlobalConfig(condenseConfig.value);
        fetchCondenseConfig();
      } catch (error) {
        console.error("Update failed:", error);
      }
    };

    const timeUnits = ref([
      { label: "Milliseconds", multiplier: 1 },
      { label: "Seconds", multiplier: 1000 },
      { label: "Minutes", multiplier: 60000 },
      { label: "Hours", multiplier: 3600000 },
      { label: "Days", multiplier: 86400000 },
    ]);

    const selectedTimeUnitScheduleRate = ref(timeUnits.value[2]);
    const selectedTimeValueScheduleRate = ref(0);
    const selectedTimeUnitCondenseAge = ref(timeUnits.value[4]);
    const selectedTimeValueCondenseAge = ref(0);

    fetchCondenseConfig();

    watch(selectedTimeUnitScheduleRate, (newUnit, oldUnit) => {
      selectedTimeValueScheduleRate.value *=
        oldUnit.multiplier / newUnit.multiplier;
    });

    watch(selectedTimeUnitCondenseAge, (newUnit, oldUnit) => {
      selectedTimeValueCondenseAge.value *=
        oldUnit.multiplier / newUnit.multiplier;
    });

    return {
      storages,
      storageTypes,
      newStorage,
      addNewStorage,
      deleteStorage,
      condenseStorage,
      condenseConfig,
      updateCondenseConfig,
      selectedTimeUnitScheduleRate,
      selectedTimeValueScheduleRate,
      selectedTimeUnitCondenseAge,
      selectedTimeValueCondenseAge,
      timeUnits,
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
          <h2>
            Configure condense
            <button style="margin-left: 1em" @click="updateCondenseConfig">
              Apply
            </button>
          </h2>
          <div class="input-group">
            <p>Schedule Rate:</p>
            <select v-model="selectedTimeUnitScheduleRate">
              <option v-for="unit in timeUnits" :key="unit.label" :value="unit">
                {{ unit.label }}
              </option>
            </select>
            <input
              v-model.number="selectedTimeValueScheduleRate"
              @keydown="blockNonNumeric"
              placeholder="Enter value"
            />

            <p>Condense Age:</p>
            <select v-model="selectedTimeUnitCondenseAge">
              <option v-for="unit in timeUnits" :key="unit.label" :value="unit">
                {{ unit.label }}
              </option>
            </select>
            <input
              v-model.number="selectedTimeValueCondenseAge"
              @keydown="blockNonNumeric"
              placeholder="Enter value"
            />
          </div>
        </div>
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
