export type CellData = {
  value: number
  formula: string | undefined
}

/**
 * セルアドレスからセルの情報へのMap
 */
export type AddressToCellMap = Map<string, CellData>
