/**
 * LOG EN TIEMPO REAL — CE4JWI
 * Indicador de estado online/offline para HRDLog.net iframe
 */

const LOG_TIMEOUT_OFFLINE_MS = 60 * 60 * 1000 // 1 hora en milisegundos

// Estado global
let lastUpdateTime = Date.now()
let statusCheckInterval = null

// Inicializar el indicador de estado
function initStatusIndicator() {
  console.log("[log] Inicializando indicador de estado")
  
  // Guardar la hora actual como última actualización
  localStorage.setItem("ce4jwi_last_update", Date.now().toString())
  lastUpdateTime = Date.now()
  
  // Verificar cada 30 segundos si debe cambiar a offline
  statusCheckInterval = setInterval(checkStatus, 30000)
  
  // Verificar inmediatamente
  checkStatus()
  
  // Detectar cambios en la página (nueva actividad en el iframe)
  // Usar el Visible Storage API si está disponible
  listenForIframeActivity()
}

// Verificar si debe mostrar offline
function checkStatus() {
  const now = Date.now()
  const elapsed = now - lastUpdateTime
  const statusBadge = document.getElementById("statusIndicator")
  const lastUpdateSpan = document.getElementById("lastUpdateTime")
  
  if (!statusBadge) return
  
  // Si han pasado más de 1 hora desde la última actualización
  if (elapsed > LOG_TIMEOUT_OFFLINE_MS) {
    if (!statusBadge.classList.contains("status-offline")) {
      console.warn("[log] 🔴 Cambiando a OFFLINE - sin actualizaciones en 1 hora")
      statusBadge.classList.remove("status-online")
      statusBadge.classList.add("status-offline")
      
      const dot = statusBadge.querySelector(".status-dot")
      const text = statusBadge.querySelector(".status-text")
      
      if (dot) dot.style.animation = "none"
      if (text) text.textContent = "Offline"
    }
  } else {
    // Mostrar online
    if (!statusBadge.classList.contains("status-online")) {
      console.log("[log] 🟢 Cambiando a ONLINE")
      statusBadge.classList.remove("status-offline")
      statusBadge.classList.add("status-online")
      
      const text = statusBadge.querySelector(".status-text")
      if (text) text.textContent = "Online"
    }
  }
  
  // Actualizar tiempo de última actualización
  if (lastUpdateSpan) {
    const minutos = Math.floor(elapsed / 60000)
    if (minutos === 0) {
      lastUpdateSpan.textContent = "ahora"
    } else if (minutos === 1) {
      lastUpdateSpan.textContent = "hace 1 min"
    } else if (minutos < 60) {
      lastUpdateSpan.textContent = `hace ${minutos} min`
    } else {
      const horas = Math.floor(minutos / 60)
      lastUpdateSpan.textContent = `hace ${horas} h`
    }
  }
}

// Detectar actividad en el iframe
function listenForIframeActivity() {
  // Intentar acceder al iframe (si no hay restricciones CORS)
  try {
    const iframe = document.querySelector(".hrdlog-iframe")
    if (iframe) {
      // Escuchar cambios en el iframe usando MutationObserver
      // Si el iframe está en el mismo origen, podemos observar cambios
      iframe.addEventListener("load", () => {
        console.log("[log] ✅ Iframe cargado")
        updateLastUpdateTime()
      })
    }
  } catch (e) {
    console.log("[log] No se puede observar el iframe (CORS)", e.message)
  }
  
  // Escuchar visibilidad de la página para refrescar el estado
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      console.log("[log] Página visible, verificando estado...")
      checkStatus()
    }
  })
}

// Actualizar la hora de última actualización
function updateLastUpdateTime() {
  lastUpdateTime = Date.now()
  localStorage.setItem("ce4jwi_last_update", lastUpdateTime.toString())
  checkStatus()
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  initStatusIndicator()
})

// También inicializar si se ejecuta después de que el DOM ya está listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStatusIndicator)
} else {
  initStatusIndicator()
}
