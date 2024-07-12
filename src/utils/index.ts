export function unreachable(...t: never[]): never {
  throw new Error(`unreachable ${JSON.stringify(t)}`)
}

/**
 * ExcelのROUND関数と全く同じ仕様の関数。
 * @param value 丸める前の数値
 * @param places 何桁目まで残すか
 * @remarks
 * `places=0`で整数丸め、`places=1`で小数点第一位、`places=2`で小数点第二位まで残して丸める。
 * 逆に`places=-1`だと10の位まで残して丸められる。
 */
export function roundToPlaces(value: number, places: number): number {
  const factor = Math.pow(10, places)
  return Math.round(value * factor) / factor
}

export function isNumeric(str: string): boolean {
  return /^-?(?:\d+\.?\d*|\.\d+)$/.test(str)
}

export function isExcelCellAddress(str: string): boolean {
  return /^[A-Z]+[1-9][0-9]*$/.test(str);
}