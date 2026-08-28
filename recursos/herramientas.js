/**
 * Herramientas CE4JWI
 * - Traductor de alfabeto fonético (ITU/OACI) y código Morse
 */

/* ============ Alfabeto fonético (ITU/OACI) y Morse ============ */

const TABLA_FONETICO_MORSE = {
  A: { fonetico: "Alfa", morse: ".-" },
  B: { fonetico: "Bravo", morse: "-..." },
  C: { fonetico: "Charlie", morse: "-.-." },
  D: { fonetico: "Delta", morse: "-.." },
  E: { fonetico: "Echo", morse: "." },
  F: { fonetico: "Foxtrot", morse: "..-." },
  G: { fonetico: "Golf", morse: "--." },
  H: { fonetico: "Hotel", morse: "...." },
  I: { fonetico: "India", morse: ".." },
  J: { fonetico: "Juliett", morse: ".---" },
  K: { fonetico: "Kilo", morse: "-.-" },
  L: { fonetico: "Lima", morse: ".-.." },
  M: { fonetico: "Mike", morse: "--" },
  N: { fonetico: "November", morse: "-." },
  O: { fonetico: "Oscar", morse: "---" },
  P: { fonetico: "Papa", morse: ".--." },
  Q: { fonetico: "Quebec", morse: "--.-" },
  R: { fonetico: "Romeo", morse: ".-." },
  S: { fonetico: "Sierra", morse: "..." },
  T: { fonetico: "Tango", morse: "-" },
  U: { fonetico: "Uniform", morse: "..-" },
  V: { fonetico: "Victor", morse: "...-" },
  W: { fonetico: "Whiskey", morse: ".--" },
  X: { fonetico: "X-ray", morse: "-..-" },
  Y: { fonetico: "Yankee", morse: "-.--" },
  Z: { fonetico: "Zulu", morse: "--.." },
  0: { fonetico: "Zero", morse: "-----" },
  1: { fonetico: "One", morse: ".----" },
  2: { fonetico: "Two", morse: "..---" },
  3: { fonetico: "Tree", morse: "...--" },
  4: { fonetico: "Fower", morse: "....-" },
  5: { fonetico: "Fife", morse: "....." },
  6: { fonetico: "Six", morse: "-...." },
  7: { fonetico: "Seven", morse: "--..." },
  8: { fonetico: "Eight", morse: "---.." },
  9: { fonetico: "Nine", morse: "----." },
}

function traducirTexto() {
  const input = document.getElementById("foneticoInput")
  const salidaFonetico = document.getElementById("salidaFonetico")
  const salidaMorse = document.getElementById("salidaMorse")
  if (!input || !salidaFonetico || !salidaMorse) return

  const texto = input.value.toUpperCase()
  const letras = texto.split("")

  const fonetico = letras
    .map((c) => {
      if (c === " ") return "/"
      const item = TABLA_FONETICO_MORSE[c]
      return item ? item.fonetico : c
    })
    .join(" ")

  const morse = letras
    .map((c) => {
      if (c === " ") return "/"
      const item = TABLA_FONETICO_MORSE[c]
      return item ? item.morse : ""
    })
    .filter(Boolean)
    .join("  ")

  salidaFonetico.textContent = fonetico || "—"
  salidaMorse.textContent = morse || "—"
}

function generarTablaFonetico() {
  const contenedor = document.getElementById("tablaFoneticoMorse")
  if (!contenedor) return

  contenedor.innerHTML = Object.entries(TABLA_FONETICO_MORSE)
    .map(
      ([letra, datos]) => `
      <div class="fonetico-item" role="button" tabindex="0" data-morse="${datos.morse}" aria-label="${letra}, ${datos.fonetico}, morse ${datos.morse}. Escuchar en morse">
        <span class="fonetico-letra">${letra}</span>
        <span class="fonetico-palabra">${datos.fonetico}</span>
        <span class="fonetico-morse">${datos.morse}</span>
        <span class="fonetico-actions">
          <span class="fonetico-play" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/>
              <path d="M14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/>
            </svg>
          </span>
          <span class="fonetico-speak" role="button" tabindex="0" data-texto="${datos.fonetico}" aria-label="Leer ${datos.fonetico} en español" title="Leer en español">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 11v2h4l5 5V6L7 11H3z"/>
              <path d="M14.5 12a3.5 3.5 0 0 0-2-3.16v6.32a3.5 3.5 0 0 0 2-3.16z"/>
              <path d="M14.5 6.29v2.05a5.5 5.5 0 0 1 0 7.32v2.05a7.5 7.5 0 0 0 0-11.42z"/>
            </svg>
          </span>
        </span>
      </div>`
    )
    .join("")

  contenedor.querySelectorAll(".fonetico-item").forEach((item) => {
    const reproducir = () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel()
      item.classList.add("playing")
      item.blur()
      reproducirMorse(item.dataset.morse)
      setTimeout(() => item.classList.remove("playing"), 800)
    }
    item.addEventListener("click", reproducir)
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        reproducir()
      }
    })
  })

  contenedor.querySelectorAll(".fonetico-speak").forEach((btn) => {
    const leer = (e) => {
      e.stopPropagation()
      btn.blur()
      leerVoz(btn.dataset.texto)
    }
    btn.addEventListener("click", leer)
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        leer(e)
      }
    })
  })
}

/* ============ Reproducción de Morse con Web Audio API ============ */

let audioCtx = null

function obtenerAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === "suspended") audioCtx.resume()
  return audioCtx
}

function reproducirMorse(morse) {
  if (!morse) return
  const ctx = obtenerAudioCtx()
  const unidad = 0.15
  const freq = 650
  const volumen = 0.25
  let t = ctx.currentTime + 0.05

  const tono = (inicio, duracion) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, inicio)
    gain.gain.linearRampToValueAtTime(volumen, inicio + 0.004)
    gain.gain.setValueAtTime(volumen, inicio + duracion - 0.004)
    gain.gain.linearRampToValueAtTime(0, inicio + duracion)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(inicio)
    osc.stop(inicio + duracion + 0.02)
  }

  let finElemento = true
  for (const simb of morse) {
    if (simb === ".") {
      tono(t, unidad)
      t += unidad
      finElemento = true
    } else if (simb === "-") {
      tono(t, unidad * 3)
      t += unidad * 3
      finElemento = true
    } else if (simb === "/") {
      t += unidad * 7
    } else if (simb === " ") {
      if (finElemento) {
        t += unidad * 2
        finElemento = false
      }
    }
  }
}

/* ============ Reproducción del texto completo ============ */

function reproducirTextoMorse() {
  const input = document.getElementById("foneticoInput")
  const texto = (input?.value || "").toUpperCase()
  const morsecode = texto
    .split("")
    .map((c) => {
      if (c === " ") return "/"
      const item = TABLA_FONETICO_MORSE[c]
      return item ? item.morse : ""
    })
    .filter(Boolean)
    .join(" ")
  if (!morsecode) return
  if ("speechSynthesis" in window) window.speechSynthesis.cancel()
  reproducirMorse(morsecode)
}

function leerTextoEnPalabras() {
  const input = document.getElementById("foneticoInput")
  const texto = (input?.value || "").toUpperCase()
  const frase = texto
    .split("")
    .map((c) => {
      if (c === " ") return ","
      const item = TABLA_FONETICO_MORSE[c]
      return item ? item.fonetico : c
    })
    .join(" ")
  if (!frase.trim()) return
  leerVoz(frase)
}

// Auto-inicializa si existe el contenedor de la tabla
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("tablaFoneticoMorse")) {
    generarTablaFonetico()
  }

  const btnPalabras = document.getElementById("btnLeerPalabras")
  if (btnPalabras) btnPalabras.addEventListener("click", leerTextoEnPalabras)

  const btnMorse = document.getElementById("btnLeerMorse")
  if (btnMorse) btnMorse.addEventListener("click", reproducirTextoMorse)
})

/* ============ Lectura en voz alta (inglés) ============ */

let vocesCargadas = null

function obtenerVozIngles() {
  if (!("speechSynthesis" in window)) return null
  const voces = window.speechSynthesis.getVoices()
  if (!voces.length) return null
  const en = voces.filter((voz) => voz.lang.toLowerCase().startsWith("en"))
  if (!en.length) return null

  const preferidas = ["Google US English", "Google UK English Female", "Google UK English Male", "Microsoft Aria Online", "Microsoft Guy Online", "Microsoft Jenny Online", "Microsoft Christopher Online", "Microsoft Zira", "Microsoft David", "Google english"]
  for (const nombre of preferidas) {
    const v = en.find((voz) => voz.name === nombre || voz.name.replace("_", " ").toLowerCase().includes(nombre.toLowerCase()))
    if (v) return v
  }

  const pref = ["en-US", "en-GB", "en-AU", "en-CA", "en-NZ", "en-IE", "en-ZA"]
  for (const p of pref) {
    const v = en.find((voz) => voz.lang.replace("_", "-").toUpperCase() === p)
    if (v) return v
  }
  return en[0]
}

function leerVoz(texto) {
  if (!texto) return
  try { window.speechSynthesis && window.speechSynthesis.cancel() } catch (e) {}
  let audio = document.getElementById("ttsAudio")
  if (!audio) {
    audio = document.createElement("audio")
    audio.id = "ttsAudio"
    document.body.appendChild(audio)
  }
  const frase = String(texto)
    .split(/[\s,]+/)
    .filter(Boolean)
    .join(" ")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
  if (!frase) return
  audio.src = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=" + encodeURIComponent(frase)
  audio.volume = 1
  audio.play().catch(function () {})

}
