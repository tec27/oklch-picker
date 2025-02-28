import type { LCH } from './interfaces'

import { forceIntoGamut, srgb2hex } from './utils.js'

const MIN_LIGHTNESS = 19.5
const MAX_LIGHTNESS = 96

// This value was roughly calculated from one of the MD palette's hue changes. There is probably
// some better, more physically-correct way of doing this with PBR-ish calculations (but we'd need
// to figure out what sort of material we're trying to simulate as well I suppose).
const LIGHTING_STRENGTH = 0.25
// This just lets you fiddle with the strength of hue change more directly.
const MATERIAL_HUE_CHANGE = 0.0021

function rotateHue(
  hue: number,
  lightHue: number,
  shadowHue: number,
  strength: number,
  isInShadow: boolean
): number {
  let targetHue = lightHue
  let clockwiseDist = (targetHue - hue + 360) % 360
  let counterClockwiseDist = (hue - targetHue + 360) % 360

  let shortestDistance = Math.min(clockwiseDist, counterClockwiseDist)
  let direction = clockwiseDist < counterClockwiseDist ? 1 : -1
  if (isInShadow) {
    direction = -direction
    targetHue = shadowHue
  }

  let newHue =
    hue + direction * (MATERIAL_HUE_CHANGE * strength * shortestDistance)

  return newHue % 360
}

/**
 * Generate a shade of a color based it's lightness tuning factor
 * @param color
 * @param lightnessTuningFactor
 * @returns hex color
 */
export const shadeColor = (
  color: LCH,
  lightColor: LCH,
  lightnessTuningFactor: number,
  chromaTuningFactor: number
): string => {
  let shadowHue = (180 + lightColor[2]) % 360

  let [l, c, h] = color

  let newL = l + lightnessTuningFactor
  let newC = Math.max(c + chromaTuningFactor, 0)
  let newH = h
  if (lightnessTuningFactor <= 0) {
    // "in shadow"
    newH = rotateHue(
      h,
      lightColor[2],
      shadowHue,
      Math.abs(lightnessTuningFactor * LIGHTING_STRENGTH),
      true
    )
    newC = Math.max(
      newC,
      newC * (1 - LIGHTING_STRENGTH) + lightColor[1] * LIGHTING_STRENGTH
    )
  } else {
    // "in light"
    newH = rotateHue(
      h,
      lightColor[2],
      shadowHue,
      Math.abs(lightnessTuningFactor * LIGHTING_STRENGTH),
      false
    )
    newC = Math.max(
      newC,
      newC * (1 - LIGHTING_STRENGTH) + lightColor[1] * LIGHTING_STRENGTH
    )
  }

  newC = Math.max(newC, 0)
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
export const generatePalette = (baseColor: LCH, lightColor: LCH): Palette => {
  let currentLightness = baseColor[0]
  let safeMaxLightness = currentLightness >= 88.5 ? 99.5 : MAX_LIGHTNESS
  let safeMinLightness = currentLightness <= 33 ? 0 : MIN_LIGHTNESS
  let lightBase = (safeMaxLightness - currentLightness) / 5
  let darkBase = (-1 * (currentLightness - safeMinLightness)) / 9

  // If the chroma is low, scale all of our values such that it will hit 0 at the edges only
  let chromaScale = baseColor[1] > 0.15 ? 1 : baseColor[1] / 0.15

  return {
    99: shadeColor(baseColor, lightColor, 4.9 * lightBase, -0.15 * chromaScale),
    95: shadeColor(baseColor, lightColor, 3.9 * lightBase, -0.07 * chromaScale),
    90: shadeColor(baseColor, lightColor, 2.7 * lightBase, -0.03 * chromaScale),
    80: shadeColor(
      baseColor,
      lightColor,
      2.25 * lightBase,
      -0.02 * chromaScale
    ),
    70: shadeColor(baseColor, lightColor, 0.6 * lightBase, -0.01 * chromaScale),
    60: shadeColor(baseColor, lightColor, 0, 0),
    50: shadeColor(baseColor, lightColor, 2.2 * darkBase, -0.01 * chromaScale),
    40: shadeColor(
      baseColor,
      lightColor,
      2.5 * 2 * darkBase,
      -0.03 * chromaScale
    ),
    30: shadeColor(
      baseColor,
      lightColor,
      3.3 * 2 * darkBase,
      -0.06 * chromaScale
    ),
    20: shadeColor(
      baseColor,
      lightColor,
      3.8 * 2 * darkBase,
      -0.1 * chromaScale
    ),
    10: shadeColor(
      baseColor,
      lightColor,
      4.4 * 2 * darkBase,
      -0.15 * chromaScale
    )
  }
}
