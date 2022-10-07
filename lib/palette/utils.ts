import type { RGB, LCH } from './interfaces'
import { parseHex, Rgb } from 'culori/fn'

import { lch2rgb } from './converter.js'

/**
 * Check if a color is within the sRGB color space
 * @param rgb
 * @returns
 */
export function isWithinGamut(rgb: RGB): boolean {
  let ε = 0.000005
  return rgb.reduce((a, b) => a && b >= 0 - ε && b <= 1 + ε, true)
}

/** Moves an lch color into sRGB or other gamut
 *  by holding the l and h steady,
 *  and adjusting the c via binary-search
 *  until the color is on the gamut boundary.
 *  Logic by [Chris Lilley](https://svgees.us/)
 */
export function forceIntoGamut(lch: LCH): RGB {
  let rgb = lch2rgb(lch)
  if (isWithinGamut(rgb)) return rgb

  let [l, c, h] = lch
  let hiC = c
  let loC = 0
  let ε = 0.0001 // .0001 chosen fairly arbitrarily as "close enough"
  c /= 2

  while (hiC - loC > ε) {
    rgb = lch2rgb([l, c, h])
    if (isWithinGamut(rgb)) loC = c
    else hiC = c
    c = (hiC + loC) / 2
  }

  return rgb
}

/**
 * Converts a hex color to an sRGB color
 * @param hex
 * @returns
 */
export function hex2rgb(hex: string): RGB {
  let { r, g, b } = parseHex(hex) as Rgb
  return [r, g, b]
}

/** Convert sRGB to hex
 *  @param rgb — channels within [0-1]
 */
export function srgb2hex([r, g, b]: RGB): string {
  let toHex = (x: number): string =>
    Math.round(Math.min(255, Math.max(0, x * 255)))
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
