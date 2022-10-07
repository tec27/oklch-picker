import LZString from 'lz-string'

import {
  setCurrentFromColor,
  valueToColor,
  current
} from '../../stores/current.js'
import { parse, formatLch } from '../../lib/colors.js'
import { generatePalette } from '../../lib/palette/palette.js'
import { visible } from '../../stores/visible.js'

let lch = document.querySelector<HTMLDivElement>('.code.is-lch')!
let lchInput = lch.querySelector<HTMLInputElement>('input')!

let rgb = document.querySelector<HTMLDivElement>('.code.is-rgb')!
let rgbInput = rgb.querySelector<HTMLInputElement>('input')!

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

function setPalette(): void {
  let value = current.get()
  let palette = generatePalette([value.l, value.c, value.h])
  paletteLink.href = `${getPaletteLink({
    name: 'playground',
    hues: [
      {
        name: 'color',
        colors: Object.values(palette)
      }
    ],
    tones: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
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
