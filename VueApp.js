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
        },
        {
          id: 'v-004',
          name: 'Truck 4',
          plate: 'ABC-124',
          status: 'online',
          type: 'Truck',
          location: { lat: 25.208, lng: 55.306249 },
          lastUpdated: new Date().toISOString(),
          history: [
            { lat: 25.2090, lng: 55.30626, timestamp: "2025-07-02T09:30:00Z" },
            { lat: 25.2092, lng: 55.30628, timestamp: "2025-07-02T10:00:00Z" }
          ]
        },
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
            radius: 10,
            color,
            fillColor: color,
            fillOpacity: 0.9,
            weight: 2
          }).addTo(map.value)

          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg">${v.name}</h3>
              <p class="text-gray-600">${v.plate}</p>
              <p class="mt-2">
                Status: <span class="font-semibold ${v.status === 'online' ? 'text-green-600' : v.status === 'offline' ? 'text-gray-600' : 'text-red-600'}">
                ${v.status}</span>
              </p>
              <p class="text-sm text-gray-500">Last update: ${new Date(v.lastUpdated).toLocaleTimeString()}</p>
              <button 
                onclick="window.viewHistory('${v.id}')"
                class="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                View History
              </button>
            </div>
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
                <div class="p-2">
                  <h3 class="font-bold text-lg">${v.name}</h3>
                  <p class="text-gray-600">${v.plate}</p>
                  <p class="mt-2">
                    Status: <span class="font-semibold ${v.status === 'online' ? 'text-green-600' : v.status === 'offline' ? 'text-gray-600' : 'text-red-600'}">
                    ${v.status}</span>
                  </p>
                  <p class="text-sm text-gray-500">Last update: ${new Date(v.lastUpdated).toLocaleTimeString()}</p>
                  <button 
                    onclick="window.viewHistory('${v.id}')"
                    class="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    View History
                  </button>
                </div>
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

      function recenterMap() {
        if (filtered.value.length > 0) {
          const bounds = []
          filtered.value.forEach(v => {
            bounds.push([v.location.lat, v.location.lng])
          })
          map.value.fitBounds(bounds, { padding: [50, 50] })
        } else {
          map.value.setView([25.276987, 55.296249], 12)
        }
      }

      return { vehicles, search, filter, filtered, focusVehicle, recenterMap }
    }
  }).mount('#app')
