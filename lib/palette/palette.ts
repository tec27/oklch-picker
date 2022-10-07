import type { LCH } from './interfaces'

import { lch2rgb } from './converter.js'
import { forceIntoGamut, srgb2hex } from './utils.js'

const MIN_LIGHTNESS = 21 // 25%
const MAX_LIGHTNESS = 97 // 98%

/**
 * Generate a shade of a color based it's lightness tuning factor
 * @param color
 * @param lightnessTuningFactor
 * @returns hex color
 */
export const shadeColor = (
  color: LCH,
  lightnessTuningFactor: number,
  chromaTuningFactor = 0
): string => {
  if (lightnessTuningFactor === 0) return srgb2hex(lch2rgb(color))

  let [l, c, h] = color

  // Add tuning to lightness
  let newL = l + lightnessTuningFactor
  let newC = c + chromaTuningFactor
  // Convert back to RGB and make sure it's within the sRGB gamut
  return srgb2hex(forceIntoGamut([newL, newC, h]))
}

type ColorTokens = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

type Palette = {
  [key in ColorTokens]: string
}

/**
 * Generate a palette of shades of a color
 * @param baseColorHex
 * @returns
 */
export const generatePalette = (baseColor: LCH): Palette => {
  let currentLightness = baseColor[0]
  let safeMaxLightness = currentLightness >= 88.5 ? 99.5 : MAX_LIGHTNESS
  let safeMinLightness = currentLightness <= 33 ? 0 : MIN_LIGHTNESS
  let lightBase = (safeMaxLightness - currentLightness) / 5
  let darkBase = (-1 * (currentLightness - safeMinLightness)) / 8
  return {
    50: shadeColor(baseColor, 5 * lightBase, -0.00375),
    100: shadeColor(baseColor, 4 * lightBase, -0.00375),
    200: shadeColor(baseColor, 3 * lightBase, -0.00375),
    300: shadeColor(baseColor, 2 * lightBase, -0.00375),
    400: shadeColor(baseColor, lightBase, -0.00375),
    500: shadeColor(baseColor, 0),
    600: shadeColor(baseColor, 1.6 * darkBase, 0.025),
    700: shadeColor(baseColor, 1.875 * 2 * darkBase, 0.05),
    800: shadeColor(baseColor, 3 * 2 * darkBase, 0.075),
    900: shadeColor(baseColor, 4 * 2 * darkBase, 0.1)
  }
}
