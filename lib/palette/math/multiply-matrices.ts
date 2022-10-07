/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
type Matrix = number[][]
type Vector = number[]

/**
 * Simple matrix (and vector) multiplication
 * Warning: No error handling for incompatible dimensions!
 *
 * @param A — m * n
 * @param B — n * p
 * @returns  m * p
 *
 * Forked from https://drafts.csswg.org/css-color-4/multiply-matrices.js
 * Copyright (c) Lea Verou 2020 | MIT License
 */
export function multiplyMatrices(
  A: Matrix | Vector,
  B: Matrix | Vector
): Matrix {
  let m = A.length

  if (!Array.isArray(A[0])) {
    // A is vector, convert to [[a, b, c, ...]]
    A = [A as Vector]
  }

  if (!Array.isArray(B[0])) {
    // B is vector, convert to [[a], [b], [c], ...]]
    B = (B as Vector).map(x => [x])
  }

  let p = (B as Matrix)[0]?.length ?? 0
  // eslint-disable-next-line @typescript-eslint/naming-convention
  let B_cols = (B[0]! as any as Vector).map((_, i) =>
    (B as Matrix).map(x => x[i]!)
  ) // transpose B
  let product = A.map(row =>
    B_cols.map(col => {
      if (!Array.isArray(row)) return col.reduce((a, c) => a + c * row, 0)

      return row.reduce((a, c, i) => a + c * (col[i] ?? 0), 0)
    })
  )

  if (m === 1) {
    product = product[0] as any // Avoid [[a, b, c, ...]]
  }

  if (p === 1) return (product as any).map((x: any) => x[0]) // Avoid [[a], [b], [c], ...]]

  return product
}
