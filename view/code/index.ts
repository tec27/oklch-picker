import type { LCH } from '../../lib/palette/interfaces.js'
import LZString from 'lz-string'

import {
  setCurrentFromColor,
  valueToColor,
  current,
  lightTemp
} from '../../stores/current.js'
import { parse, formatLch, oklch } from '../../lib/colors.js'
import { generatePalette } from '../../lib/palette/palette.js'
import { visible } from '../../stores/visible.js'

let lch = document.querySelector<HTMLDivElement>('.code.is-lch')!
let lchInput = lch.querySelector<HTMLInputElement>('input')!

let rgb = document.querySelector<HTMLDivElement>('.code.is-rgb')!
let rgbInput = rgb.querySelector<HTMLInputElement>('input')!

let temperature = document.querySelector<HTMLDivElement>('.code.is-light-temp')!
let temperatureInput = temperature.querySelector<HTMLInputElement>('input')!

let paletteLink = document.querySelector<HTMLAnchorElement>('#palette-link')!
let demo = document.querySelector<HTMLDivElement>('#palette-demo')!

let notePaste = document.querySelector<HTMLDivElement>('.code_note.is-paste')!
let noteFallback = document.querySelector<HTMLDivElement>(
  '.code_note.is-fallback'
)!

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPaletteLink(hexPalette: any): string {
  let compressed = LZString.compressToEncodedURIComponent(
    JSON.stringify(hexPalette)
  )
  let url = new URL('https://huetone.ardov.me/')
  url.searchParams.set('palette', compressed)
  return url.toString()
}

function toggle(input: HTMLElement, invalid: boolean): void {
  if (invalid) {
    input.setAttribute('aria-invalid', 'true')
  } else {
    input.removeAttribute('aria-invalid')
  }
}

let prevValues = new Map<HTMLInputElement, string>()
let locked = new Map<HTMLInputElement, boolean>()

function setLch(): void {
  let value = current.get()
  let text = formatLch(valueToColor(value))
  prevValues.set(lchInput, text)
  lchInput.value = text
  toggle(lchInput, false)
  setPalette()
}

function lightTempToLch(temp: number): LCH {
  let workingTemp = temp / 100
  let r = 255
  let g = 255
  let b = 255

  // red
  if (workingTemp >= 66) {
    r = 329.698727446 * (workingTemp - 60) ** -0.1332047592
  }

  // green
  if (workingTemp <= 66) {
    g = 99.4708025861 * Math.log(workingTemp) - 161.1195681661
  } else {
    g = 288.1221695283 * (workingTemp - 60) ** -0.0755148492
  }

  // blue
  if (workingTemp <= 19) {
    b = 0
  } else if (workingTemp >= 66) {
    b = 255
  } else {
    b = 138.5177312231 * Math.log(workingTemp - 10) - 305.0447927307
  }

  r = Math.min(255, Math.max(0, r))
  g = Math.min(255, Math.max(0, g))
  b = Math.min(255, Math.max(0, b))

  let parsed = parse(`rgb(${r}, ${g}, ${b})`)
  let value = oklch(parsed)!
  return [value.l, value.c, value.h ?? 0]
}

function setPalette(): void {
  let value = current.get()
  let temp = lightTemp.get()
  let palette = generatePalette(
    [value.l, value.c, value.h],
    lightTempToLch(temp)
  )
  paletteLink.href = `${getPaletteLink({
    name: 'playground',
    hues: [
      {
        name: 'color',
        colors: Object.values(palette)
      }
    ],
    tones: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '95', '99']
  })}`
  toggle(paletteLink, false)
  Object.entries(palette).forEach(([k, v]) => {
    demo.style.setProperty(`--palette-${k}`, v)
  })
}

function setRgb(): void {
  let { fallback, space } = visible.get()
  prevValues.set(rgbInput, fallback)
  rgbInput.value = fallback
  if (space === 'srgb') {
    notePaste.classList.remove('is-hidden')
    noteFallback.classList.add('is-hidden')
  } else {
    notePaste.classList.add('is-hidden')
    noteFallback.classList.remove('is-hidden')
  }
  toggle(rgbInput, false)
  setPalette()
}

function setLightTemp(): void {
  let temp = lightTemp.get()
  prevValues.set(temperatureInput, String(temp))
  temperatureInput.value = String(temp)
  toggle(temperatureInput, false)
  setPalette()
}

current.subscribe(() => {
  if (!locked.get(lchInput)) {
    setLch()
  }
})

visible.subscribe(() => {
  if (!locked.get(rgbInput)) {
    setRgb()
  }
})

lightTemp.subscribe(() => {
  setLightTemp()
})

function listenChanges(input: HTMLInputElement): void {
  function processChange(): void {
    let newValue = input.value.trim()

    if (newValue === prevValues.get(input)) return
    prevValues.set(input, newValue)

    let parsed = parse(newValue)
    if (parsed) {
      setCurrentFromColor(parsed)
      toggle(input, false)
    } else {
      toggle(input, true)
      toggle(paletteLink, true)
    }
  }

  input.addEventListener('change', processChange)
  input.addEventListener('keyup', e => {
    if (e.key === 'Enter') {
      input.blur()
    } else {
      processChange()
    }
  })
  input.addEventListener('focus', () => {
    locked.set(input, true)
  })
  input.addEventListener('blur', () => {
    locked.set(input, false)
    if (input === lchInput) {
      setLch()
    } else {
      setRgb()
    }
  })
}

listenChanges(lchInput)
listenChanges(rgbInput)

function listenLightChanges(input: HTMLInputElement): void {
  function processChange(): void {
    let newValue = input.value.trim()

    if (newValue === prevValues.get(input)) return
    prevValues.set(input, newValue)

    if (/^\d+$/.test(newValue)) {
      let parsed = Number(newValue)
      lightTemp.set(parsed)
      toggle(input, false)
    } else {
      toggle(input, true)
      toggle(paletteLink, true)
    }
  }

  input.addEventListener('change', processChange)
  input.addEventListener('keyup', e => {
    if (e.key === 'Enter') {
      input.blur()
    } else {
      processChange()
    }
  })
}
listenLightChanges(temperatureInput)
