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
  0: { fonetico: "Cero", morse: "-----" },
  1: { fonetico: "Uno", morse: ".----" },
  2: { fonetico: "Dos", morse: "..---" },
  3: { fonetico: "Tres", morse: "...--" },
  4: { fonetico: "Cuatro", morse: "....-" },
  5: { fonetico: "Cinco", morse: "....." },
  6: { fonetico: "Seis", morse: "-...." },
  7: { fonetico: "Siete", morse: "--..." },
  8: { fonetico: "Ocho", morse: "---.." },
  9: { fonetico: "Nueve", morse: "----." },
}

function traducirTexto() {
  const input = document.getElementById("foneticoInput")
  const salidaFonetico = document.getElementById("salidaFonetico")
  const salidaMorse = document.getElementById("salidaMorse")
  if (!input) return

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
      <div class="fonetico-item">
        <span class="fonetico-letra">${letra}</span>
        <span class="fonetico-palabra">${datos.fonetico}</span>
        <span class="fonetico-morse">${datos.morse}</span>
      </div>`
    )
    .join("")
}

// Auto-inicializa si existe el contenedor de la tabla
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("tablaFoneticoMorse")) {
    generarTablaFonetico()
  }
})
