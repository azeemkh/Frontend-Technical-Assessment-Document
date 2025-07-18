<!-- <script setup>
import {ref} from 'vue'

const count = ref(0)
</script>

<template>
  <h1>Hello Vue 3</h1>
  <button @click="count++">Count is: {{ count }}</button>
</template>

<style scoped>
button {
  font-weight: bold;
}
</style> -->



<template>
  <div>
    <h1 style="text-align: center;">Live Vehicle Tracker</h1>
    
    <div style="text-align: center;">
      <input v-model="searchQuery" placeholder="Search by name or plate" />
      <select v-model="statusFilter">
        <option value="">All</option>
        <option value="online">🟢 Online</option>
        <option value="offline">⚪ Offline</option>
        <option value="alert">🔴 Alert</option>
      </select>
    </div>

    <div id="map"></div>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Plate</th>
          <th>Status</th>
          <th>Type</th>
          <th>Last Updated</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="v in filteredVehicles" :key="v.id" @click="centerMap(v)">
          <td>{{ v.name }}</td>
          <td>{{ v.plate }}</td>
          <td>{{ v.status }}</td>
          <td>{{ v.type }}</td>
          <td>{{ new Date(v.lastUpdated).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import L from 'leaflet'

// Mock vehicle data
const vehicles = ref([
  {
    id: 'v-001',
    name: 'Truck 1',
    plate: 'ABC-123',
    type: 'Truck',
    status: 'online',
    location: { lat: 25.276987, lng: 55.296249 },
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'v-002',
    name: 'Van 2',
    plate: 'XYZ-789',
    type: 'Van',
    status: 'offline',
    location: { lat: 25.285, lng: 55.28 },
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'v-003',
    name: 'Car 3',
    plate: 'LMN-456',
    type: 'Car',
    status: 'alert',
    location: { lat: 25.27, lng: 55.30 },
    lastUpdated: new Date().toISOString()
  }
])

const map = ref(null)
const markers = ref({})
const searchQuery = ref('')
const statusFilter = ref('')

const filteredVehicles = computed(() => {
  return vehicles.value.filter(v => {
    const q = searchQuery.value.toLowerCase()
    const matches = v.name.toLowerCase().includes(q) || v.plate.toLowerCase().includes(q)
    const statusOk = !statusFilter.value || v.status === statusFilter.value
    return matches && statusOk
  })
})

onMounted(() => {
  map.value = L.map('map').setView([25.276987, 55.296249], 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)

  updateMarkers()
  setInterval(updateMockPositions, 5000)
})

function updateMarkers() {
  vehicles.value.forEach(v => {
    const color = v.status === 'online' ? 'green' : (v.status === 'offline' ? 'gray' : 'red')
    const marker = L.circleMarker([v.location.lat, v.location.lng], {
      radius: 8,
      color: color,
      fillColor: color,
      fillOpacity: 0.8
    }).addTo(map.value)

    marker.bindTooltip(`${v.name} (${v.plate})`)
    markers.value[v.id] = marker
  })
}

function updateMockPositions() {
  vehicles.value.forEach(v => {
    if (v.status === 'online') {
      v.location.lat += (Math.random() - 0.5) * 0.001
      v.location.lng += (Math.random() - 0.5) * 0.001
      v.lastUpdated = new Date().toISOString()

      const m = markers.value[v.id]
      if (m) m.setLatLng([v.location.lat, v.location.lng])
    }
  })
}

function centerMap(vehicle) {
  map.value.panTo([vehicle.location.lat, vehicle.location.lng])
}
</script>

<style scoped>
@import './style.css';
</style>
