export type XYZ = [number, number, number]
export type LAB = [number, number, number]
export type LCH = [number, number, number]
export type RGB = [number, number, number]

export type Channel = 'l' | 'c' | 'h'

export interface HexPalette {
  name: string
  tones: string[]
  hues: {
    name: string
    colors: string[]
  }[]

  // Used only locally
  isPreset?: boolean
}

interface ColorToken {
  value: string
  type: 'color'
}

export interface TokenExport {
  [hue: string]: {
    [tone: string]: ColorToken
  }
}

export interface TColor {
  l: number
  c: number
  h: number
  r: number
  g: number
  b: number
  hex: string
  within_sRGB: boolean
  within_P3: boolean
}

export interface TLchModel {
  rgb2lch: (rgb: RGB) => LCH
  lch2rgb: (lch: LCH) => RGB
  rgbTreshold: { min: number; max: number }
  ranges: {
    l: { min: number; max: number }
    c: { min: number; max: number }
    h: { min: number; max: number }
  }
}

export interface Palette {
  name: string
  hues: string[]
  tones: string[]
  colors: TColor[][]
}

export interface OldLchPalette {
  name: string
  hues: string[]
  tones: string[]
  colors: LCH[][]
}
