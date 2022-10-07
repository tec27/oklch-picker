/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-loss-of-precision */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-loss-of-precision */
/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Conversion can also be done using ICC profiles and a Color Management System
 *
 *
 * Forked from https://drafts.csswg.org/css-color-4/conversions.js
 * Copyright (c) World Wide Web Consortium | The W3C® SOFTWARE NOTICE AND LICENSE
 *
 */
import type { LAB, LCH, RGB, XYZ } from '../interfaces'

import { multiplyMatrices } from './multiply-matrices.js'

type Refs = [number, number, number]

// standard white points, defined by 4-figure CIE x,y chromaticities
const D50: Refs = [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585]
const D65: Refs = [0.3127 / 0.329, 1.0, (1.0 - 0.3127 - 0.329) / 0.329]

// sRGB-related functions

export function lin_sRGB(RGB: RGB): RGB {
  // convert an array of sRGB values
  // where in-gamut values are in the range [0 - 1]
  // to linear light (un-companded) form.
  // https://en.wikipedia.org/wiki/SRGB
  // Extended transfer function:
  // for negative values,  linear portion is extended on reflection of axis,
  // then reflected power function is used.
  return RGB.map(val => {
    let sign = val < 0 ? -1 : 1
    let abs = Math.abs(val)

    if (abs < 0.04045) {
      return val / 12.92
    }

    return sign * ((abs + 0.055) / 1.055) ** 2.4
  }) as RGB
}

export function gam_sRGB(RGB: RGB): RGB {
  // convert an array of linear-light sRGB values in the range 0.0-1.0
  // to gamma corrected form
  // https://en.wikipedia.org/wiki/SRGB
  // Extended transfer function:
  // For negative values, linear portion extends on reflection
  // of axis, then uses reflected pow below that
  return RGB.map(val => {
    let sign = val < 0 ? -1 : 1
    let abs = Math.abs(val)

    if (abs > 0.0031308) {
      return sign * (1.055 * abs ** (1 / 2.4) - 0.055)
    }

    return 12.92 * val
  }) as RGB
}

export function lin_sRGB_to_XYZ(rgb: RGB): XYZ {
  // convert an array of linear-light sRGB values to CIE XYZ
  // using sRGB's own white, D65 (no chromatic adaptation)

  let M = [
    [506752 / 1228815, 87881 / 245763, 12673 / 70218],
    [87098 / 409605, 175762 / 245763, 12673 / 175545],
    [7918 / 409605, 87881 / 737289, 1001167 / 1053270]
  ]
  return multiplyMatrices(M, rgb) as unknown as XYZ
}

export function XYZ_to_lin_sRGB(XYZ: XYZ): RGB {
  // convert XYZ to linear-light sRGB

  let M = [
    [12831 / 3959, -329 / 214, -1974 / 3959],
    [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
    [705 / 12673, -2585 / 12673, 705 / 667]
  ]

  return multiplyMatrices(M, XYZ) as unknown as RGB
}

//  display-p3-related functions

export function lin_P3(RGB: RGB): RGB {
  // convert an array of display-p3 RGB values in the range 0.0 - 1.0
  // to linear light (un-companded) form.

  return lin_sRGB(RGB) // same as sRGB
}

export function gam_P3(RGB: RGB): RGB {
  // convert an array of linear-light display-p3 RGB  in the range 0.0-1.0
  // to gamma corrected form

  return gam_sRGB(RGB) // same as sRGB
}

export function lin_P3_to_XYZ(rgb: RGB): XYZ {
  // convert an array of linear-light display-p3 values to CIE XYZ
  // using  D65 (no chromatic adaptation)
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  let M = [
    [608311 / 1250200, 189793 / 714400, 198249 / 1000160],
    [35783 / 156275, 247089 / 357200, 198249 / 2500400],
    [0 / 1, 32229 / 714400, 5220557 / 5000800]
  ]

  return multiplyMatrices(M, rgb) as unknown as XYZ
}

export function XYZ_to_lin_P3(xyz: XYZ): RGB {
  // convert XYZ to linear-light P3
  let M = [
    [446124 / 178915, -333277 / 357830, -72051 / 178915],
    [-14852 / 17905, 63121 / 35810, 423 / 17905],
    [11844 / 330415, -50337 / 660830, 316169 / 330415]
  ]

  return multiplyMatrices(M, xyz) as unknown as RGB
}

// prophoto-rgb functions is ignored that is not used

// a98-rgb functions is ignored that is not used

// Rec. 2020-related functions is ignored that is not used

// Chromatic adaptation

export function D65_to_D50(xyz: XYZ): XYZ {
  // Bradford chromatic adaptation from D65 to D50
  // The matrix below is the result of three operations:
  // - convert from XYZ to retinal cone domain
  // - scale components from one reference white to another
  // - convert back to XYZ
  // http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html
  let M = [
    [1.0479298208405488, 0.022946793341019088, -0.05019222954313557],
    [0.029627815688159344, 0.990434484573249, -0.01707382502938514],
    [-0.009243058152591178, 0.015055144896577895, 0.7518742899580008]
  ]

  return multiplyMatrices(M, xyz) as unknown as XYZ
}

export function D50_to_D65(xyz: XYZ): XYZ {
  // Bradford chromatic adaptation from D50 to D65
  let M = [
    [0.9554734527042182, -0.023098536874261423, 0.0632593086610217],
    [-0.028369706963208136, 1.0099954580058226, 0.021041398966943008],
    [0.012314001688319899, -0.020507696433477912, 1.3303659366080753]
  ]

  return multiplyMatrices(M, xyz) as unknown as XYZ
}

// CIE Lab and LCH

export function XYZ_to_Lab(xyz: XYZ): LAB {
  // Assuming XYZ is relative to D50, convert to CIE Lab
  // from CIE standard, which now defines these as a rational fraction
  let Îµ = 216 / 24389 // 6^3/29^3
  let Îº = 24389 / 27 // 29^3/3^3

  // compute xyz, which is XYZ scaled relative to reference white
  let xyzC = xyz.map((value, i) => value / D50[i]!)

  // now compute f
  let f = xyzC.map(value =>
    value > Îµ ? Math.cbrt(value) : (Îº * value + 16) / 116
  )

  return [
    116 * f[1]! - 16, // L
    500 * (f[0]! - f[1]!), // a
    200 * (f[1]! - f[2]!) // b
  ]
  // L in range [0,100]. For use in CSS, add a percent
}

export function Lab_to_XYZ(lab: LAB): XYZ {
  // Convert Lab to D50-adapted XYZ
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  let Îº = 24389 / 27 // 29^3/3^3
  let Îµ = 216 / 24389 // 6^3/29^3
  let f = []

  // compute f, starting with the luminance-related term
  f[1] = (lab[0] + 16) / 116
  f[0] = lab[1] / 500 + f[1]
  f[2] = f[1] - lab[2] / 200

  // compute xyz
  let xyz = [
    f[0] ** 3 > Îµ ? f[0] ** 3 : (116 * f[0] - 16) / Îº,
    lab[0] > Îº * Îµ ? ((lab[0] + 16) / 116) ** 3 : lab[0] / Îº,
    f[2] ** 3 > Îµ ? f[2] ** 3 : (116 * f[2] - 16) / Îº
  ]

  // Compute XYZ by scaling xyz by reference white
  return xyz.map((value, i) => value * D50[i]!) as XYZ
}

function Lab_to_LCH(lab: LAB): LCH {
  // Convert to polar form
  let hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI
  return [
    lab[0], // L is still L
    Math.sqrt(lab[1] ** 2 + lab[2] ** 2), // Chroma
    hue >= 0 ? hue : hue + 360 // Hue, in degrees [0 to 360)
  ]
}

export function LCH_to_Lab(lch: LCH): LAB {
  // Convert from polar form
  return [
    lch[0], // L is still L
    lch[1] * Math.cos((lch[2] * Math.PI) / 180), // a
    lch[1] * Math.sin((lch[2] * Math.PI) / 180) // b
  ]
}

// OKLab and OKLCH
// https://bottosson.github.io/posts/oklab/

// XYZ <-> LMS matrices recalculated for consistent reference white
// see https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-943521484

export function XYZ_to_OKLab(xyz: XYZ): LAB {
  // Given XYZ relative to D65, convert to OKLab
  let XYZtoLMS = [
    [0.8190224432164319, 0.3619062562801221, -0.12887378261216414],
    [0.0329836671980271, 0.9292868468965546, 0.03614466816999844],
    [0.048177199566046255, 0.26423952494422764, 0.6335478258136937]
  ]
  let LMStoOKLab = [
    [0.2104542553, 0.793617785, -0.0040720468],
    [1.9779984951, -2.428592205, 0.4505937099],
    [0.0259040371, 0.7827717662, -0.808675766]
  ]

  let LMS = multiplyMatrices(XYZtoLMS, xyz)
  return multiplyMatrices(
    LMStoOKLab,
    LMS.map(c => Math.cbrt(c as any))
  ) as unknown as LAB
  // L in range [0,1]. For use in CSS, multiply by 100 and add a percent
}

export function OKLab_to_XYZ(lab: LAB): XYZ {
  // Given OKLab, convert to XYZ relative to D65
  let LMStoXYZ = [
    [1.2268798733741557, -0.5578149965554813, 0.28139105017721583],
    [-0.04057576262431372, 1.1122868293970594, -0.07171106666151701],
    [-0.07637294974672142, -0.4214933239627914, 1.5869240244272418]
  ]
  let OKLabtoLMS = [
    [0.99999999845051981432, 0.39633779217376785678, 0.21580375806075880339],
    [1.0000000088817607767, -0.1055613423236563494, -0.063854174771705903402],
    [1.0000000546724109177, -0.089484182094965759684, -1.2914855378640917399]
  ]

  let LMSnl = multiplyMatrices(OKLabtoLMS, lab)
  return multiplyMatrices(
    LMStoXYZ,
    LMSnl.map(c => (c as any) ** 3)
  ) as unknown as XYZ
}

export function OKLab_to_OKLCH(lab: LAB): LCH {
  let hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI
  return [
    lab[0], // L is still L
    Math.sqrt(lab[1] ** 2 + lab[2] ** 2), // Chroma
    hue >= 0 ? hue : hue + 360 // Hue, in degrees [0 to 360)
  ]
}

export function OKLCH_to_OKLab(lch: LCH): LAB {
  return [
    lch[0], // L is still L
    lch[1] * Math.cos((lch[2] * Math.PI) / 180), // a
    lch[1] * Math.sin((lch[2] * Math.PI) / 180) // b
  ]
}

// Premultiplied alpha conversions functions is ignored that is not used
