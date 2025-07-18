// import { createApp } from 'vue'
// import App from './App.vue'

// console.log('Hello world')

// createApp(App).mount('#app')




// import { createApp } from 'vue'
// import App from './App.vue'
// import 'leaflet/dist/leaflet.css'

// // Leaflet icon fix
// import L from 'leaflet'
// import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
// import iconUrl from 'leaflet/dist/images/marker-icon.png'
// import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// delete L.Icon.Default.prototype._getIconUrl
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl,
//   iconUrl,
//   shadowUrl
// })

// createApp(App).mount('#app')






// const { createApp, ref, onMounted } = Vue

// createApp({
//   setup() {
//     const vehicles = ref([
//       {
//         id: 'v-001',
//         name: 'Truck 1',
//         plate: 'ABC-123',
//         status: 'online',
//         location: { lat: 25.276987, lng: 55.296249 },
//         lastUpdated: new Date().toISOString()
//       },
//       {
//         id: 'v-002',
//         name: 'Van 2',
//         plate: 'XYZ-789',
//         status: 'offline',
//         location: { lat: 25.285, lng: 55.28 },
//         lastUpdated: new Date().toISOString()
//       },
//       {
//         id: 'v-003',
//         name: 'Car 3',
//         plate: 'LMN-456',
//         status: 'alert',
//         location: { lat: 25.27, lng: 55.30 },
//         lastUpdated: new Date().toISOString()
//       }
//     ])

//     const map = ref(null)
//     const markers = ref({})

//     onMounted(() => {
//       map.value = L.map('map').setView([25.276987, 55.296249], 12)

//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© OpenStreetMap contributors'
//       }).addTo(map.value)

//       vehicles.value.forEach(v => {
//         const color = v.status === 'online' ? 'green' : (v.status === 'offline' ? 'gray' : 'red')
//         const marker = L.circleMarker([v.location.lat, v.location.lng], {
//           radius: 8,
//           color: color,
//           fillColor: color,
//           fillOpacity: 0.8
//         }).addTo(map.value)
//         marker.bindTooltip(`${v.name} (${v.plate})`)
//         markers.value[v.id] = marker
//       })

//       setInterval(() => {
//         vehicles.value.forEach(v => {
//           if (v.status === 'online') {
//             v.location.lat += (Math.random() - 0.5) * 0.001
//             v.location.lng += (Math.random() - 0.5) * 0.001
//             v.lastUpdated = new Date().toISOString()

//             const m = markers.value[v.id]
//             if (m) m.setLatLng([v.location.lat, v.location.lng])
//           }
//         })
//       }, 5000)
//     })

//     return { vehicles }
//   },
//   template: `
//     <div>
//       <h1>Live Vehicle Tracker</h1>
//       <div id="map"></div>
//       <table>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Plate</th>
//             <th>Status</th>
//             <th>Last Updated</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr v-for="v in vehicles" :key="v.id">
//             <td>{{ v.name }}</td>
//             <td>{{ v.plate }}</td>
//             <td>{{ v.status }}</td>
//             <td>{{ new Date(v.lastUpdated).toLocaleString() }}</td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   `
// }).mount('#app')












const { createApp, ref, onMounted, computed } = Vue

createApp({
  setup() {
    const vehicles = ref([
      {
        id: 'v-001',
        name: 'Truck 1',
        plate: 'ABC-123',
        status: 'online',
        type: 'Truck',
        location: { lat: 25.276987, lng: 55.296249 },
        lastUpdated: new Date().toISOString(),
        history: [
          { lat: 25.2760, lng: 55.2950, timestamp: "2025-07-02T09:30:00Z" },
          { lat: 25.2765, lng: 55.2955, timestamp: "2025-07-02T10:00:00Z" }
        ]
      },
      {
        id: 'v-002',
        name: 'Van 2',
        plate: 'XYZ-789',
        status: 'offline',
        type: 'Van',
        location: { lat: 25.285, lng: 55.28 },
        lastUpdated: new Date().toISOString(),
        history: []
      },
      {
        id: 'v-003',
        name: 'Car 3',
        plate: 'LMN-456',
        status: 'alert',
        type: 'Car',
        location: { lat: 25.27, lng: 55.30 },
        lastUpdated: new Date().toISOString(),
        history: [
          { lat: 25.269, lng: 55.299, timestamp: "2025-07-02T09:30:00Z" },
          { lat: 25.271, lng: 55.301, timestamp: "2025-07-02T10:15:00Z" }
        ]
      }
    ])

    const map = ref(null)
    const markers = ref({})
    const search = ref('')
    const filter = ref('')
    const routeLine = ref(null)

    const filtered = computed(() =>
      vehicles.value.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(search.value.toLowerCase()) ||
                              v.plate.toLowerCase().includes(search.value.toLowerCase())
        const matchesFilter = !filter.value || v.status === filter.value
        return matchesSearch && matchesFilter
      })
    )

    onMounted(() => {
      map.value = L.map('map').setView([25.276987, 55.296249], 12)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.value)

      renderMarkers()
      setInterval(updatePositions, 5000)
    })

    function renderMarkers() {
      vehicles.value.forEach(v => {
        const color = v.status === 'online' ? 'green' : (v.status === 'offline' ? 'gray' : 'red')
        const marker = L.circleMarker([v.location.lat, v.location.lng], {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.9
        }).addTo(map.value)

        marker.bindPopup(`
          <b>${v.name}</b><br>
          ${v.plate}<br>
          Status: ${v.status}<br>
          Last Update: ${new Date(v.lastUpdated).toLocaleTimeString()}<br>
          <button onclick="window.viewHistory('${v.id}')">View History</button>
        `)

        markers.value[v.id] = marker
      })
    }

    function updatePositions() {
      vehicles.value.forEach(v => {
        if (v.status === 'online') {
          v.location.lat += (Math.random() - 0.5) * 0.001
          v.location.lng += (Math.random() - 0.5) * 0.001
          v.lastUpdated = new Date().toISOString()
          v.history.push({
            lat: v.location.lat,
            lng: v.location.lng,
            timestamp: v.lastUpdated
          })

          const m = markers.value[v.id]
          if (m) {
            m.setLatLng([v.location.lat, v.location.lng])
            m.setPopupContent(`
              <b>${v.name}</b><br>
              ${v.plate}<br>
              Status: ${v.status}<br>
              Last Update: ${new Date(v.lastUpdated).toLocaleTimeString()}<br>
              <button onclick="window.viewHistory('${v.id}')">View History</button>
            `)
          }
        }
      })
    }

    window.viewHistory = (id) => {
      const vehicle = vehicles.value.find(v => v.id === id)
      if (!vehicle || !vehicle.history.length) return alert("No route data.")
      
      if (routeLine.value) {
        map.value.removeLayer(routeLine.value)
      }

      const route = vehicle.history.map(p => [p.lat, p.lng])
      routeLine.value = L.polyline(route, { color: 'blue' }).addTo(map.value)
      map.value.fitBounds(routeLine.value.getBounds())
    }

    function focusVehicle(v) {
      map.value.setView([v.location.lat, v.location.lng], 14)
    }

    return { vehicles, search, filter, filtered, focusVehicle }
  },
  template: `
    <div>
      <div class="controls">
        <input v-model="search" placeholder="Search by name or plate" />
        <select v-model="filter">
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
            <th>Type</th>
            <th>Status</th>
            <th>Last Update</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in filtered" :key="v.id" @click="focusVehicle(v)">
            <td>{{ v.name }}</td>
            <td>{{ v.plate }}</td>
            <td>{{ v.type }}</td>
            <td>{{ v.status }}</td>
            <td>{{ new Date(v.lastUpdated).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
}).mount('#app')
