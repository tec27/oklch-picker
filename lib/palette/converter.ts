/* eslint-disable camelcase */
import type { LCH, RGB, XYZ } from './interfaces'

import {
  OKLab_to_XYZ,
  OKLCH_to_OKLab,
  OKLab_to_OKLCH,
  XYZ_to_OKLab,
  gam_sRGB,
  XYZ_to_lin_sRGB,
  lin_sRGB_to_XYZ,
  lin_sRGB
} from './math/css-color-4-conversions.js'
import {} from './utils.js'

/**
 * Converts OKLCH to XYZ
 * @param lch - OKLCH color
 * @returns XYZ color
 */
export const lch2xyz = (lch: LCH): XYZ => {
  let [l, c, h] = lch
  return OKLab_to_XYZ(OKLCH_to_OKLab([l / 100, c, h]))
}

/**
 * Converts XYZ to OKLCH
 * @param xyz - XYZ color
 * @returns OKLCH color
 */
export const xyz2lch = (xyz: XYZ): LCH => {
  let [l, c, h] = OKLab_to_OKLCH(XYZ_to_OKLab(xyz))
  return [l * 100, c, h]
}

/**
 * Converts XYZ to sRGB
 * @param xyz - XYZ color
 * @returns sRGB color
 */
export const xyz2rgb = (xyz: XYZ): RGB => gam_sRGB(XYZ_to_lin_sRGB(xyz))

/**
 * Converts sRGB to XYZ
 * @param rgb - sRGB color
 * @returns  XYZ color
 */
export const rgb2xyz = (rgb: RGB): XYZ => lin_sRGB_to_XYZ(lin_sRGB(rgb))

/**
 * Converts sRGB to XYZ
 * @param lch - OKLCH color
 * @returns sRGB color
 */
export const lch2rgb = (lch: LCH): RGB => xyz2rgb(lch2xyz(lch))

/**
 * Converts sRGB to OKLCH
 * @param rgb - sRGB color
 * @returns OKLCH color
 */
export const rgb2lch = (rgb: RGB): LCH => xyz2lch(rgb2xyz(rgb))
