import type { LCH } from './interfaces'

import { forceIntoGamut, srgb2hex } from './utils.js'

const MIN_LIGHTNESS = 19.5
const MAX_LIGHTNESS = 96

const YELLOW_HUE = 100
const BLUE_HUE = 260

/**
 * Generate a shade of a color based it's lightness tuning factor
 * @param color
 * @param lightnessTuningFactor
 * @param towardsYellow hue tuning factor, positive = "towards yellow" and negative = "towards blue"
 * @returns hex color
 */
export const shadeColor = (
  color: LCH,
  lightnessTuningFactor: number,
  chromaTuningFactor: number,
  towardsYellow: number
): string => {
  let [l, c, h] = color

  // Add tuning to lightness
  let newL = l + lightnessTuningFactor
  let newC = Math.max(c + chromaTuningFactor, 0)
  let newH = h
  if (h < YELLOW_HUE) {
    if (towardsYellow >= 0) {
      newH = Math.min(h + towardsYellow, YELLOW_HUE)
    } else {
      newH = (360 + h + towardsYellow) % 360
      if (newH > YELLOW_HUE && newH < BLUE_HUE) {
        newH = BLUE_HUE
      }
    }
  } else if (h < BLUE_HUE) {
    if (towardsYellow >= 0) {
      newH = Math.max(h - towardsYellow, YELLOW_HUE)
    } else {
      newH = Math.min(h - towardsYellow, BLUE_HUE)
    }
  } else if (h >= BLUE_HUE) {
    // h is right of BLUE_HUE
    if (towardsYellow >= 0) {
      newH = (h + towardsYellow) % 360
      if (newH > YELLOW_HUE && newH < BLUE_HUE) {
        newH = YELLOW_HUE
      }
    } else {
      newH = Math.max(h + towardsYellow, BLUE_HUE)
    }
  }
  // Convert back to RGB and make sure it's within the sRGB gamut
  return srgb2hex(forceIntoGamut([newL, newC, newH]))
}

type ColorTokens = 99 | 95 | 90 | 80 | 70 | 60 | 50 | 40 | 30 | 20 | 10

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
  let darkBase = (-1 * (currentLightness - safeMinLightness)) / 9
  return {
    99: shadeColor(baseColor, 5 * lightBase, -0.16, 9.4),
    95: shadeColor(baseColor, 4 * lightBase, -0.15, 5),
    90: shadeColor(baseColor, 3 * lightBase, -0.1, 4.5),
    80: shadeColor(baseColor, 2 * lightBase, -0.05, 3.5),
    70: shadeColor(baseColor, 0.8 * lightBase, -0.01, 2.5),
    60: shadeColor(baseColor, 0, 0, 0),
    50: shadeColor(baseColor, 2.2 * darkBase, -0.01, -2),
    40: shadeColor(baseColor, 2.5 * 2 * darkBase, -0.03, -4.5),
    30: shadeColor(baseColor, 3.4 * 2 * darkBase, -0.06, -6.5),
    20: shadeColor(baseColor, 4 * 2 * darkBase, -0.12, -9),
    10: shadeColor(baseColor, 4.5 * 2 * darkBase, -0.182, -12)
  }
}
