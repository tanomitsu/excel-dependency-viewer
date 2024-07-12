import { isExcelCellAddress, isNumeric, roundToPlaces } from "."

describe("utils", () => {
  test("roundToPlaces", () => {
    expect(roundToPlaces(123.456, 0)).toBe(123)
    expect(roundToPlaces(123.456, 1)).toBe(123.5)
    expect(roundToPlaces(123.456, -1)).toBe(120)
    expect(roundToPlaces(0, 1)).toBe(0)
    expect(roundToPlaces(0, 0)).toBe(0)
    expect(roundToPlaces(-123.456, 0)).toBe(-123)
    expect(roundToPlaces(-123.456, 1)).toBe(-123.5)
    expect(roundToPlaces(-123.456, -1)).toBe(-120)
  })

  test("isNumeric", () => {
    expect(isNumeric("123")).toBe(true)
    expect(isNumeric("123.45")).toBe(true)
    expect(isNumeric("-123.45")).toBe(true)
    expect(isNumeric("123.")).toBe(true)
    expect(isNumeric(".45")).toBe(true)
    expect(isNumeric("123a45")).toBe(false)
    expect(isNumeric("..45")).toBe(false)
    expect(isNumeric("123..")).toBe(false)
  })

  test("isExcelCellAddress", () => {
    expect(isExcelCellAddress("A1")).toBe(true)
    expect(isExcelCellAddress("B2")).toBe(true)
    expect(isExcelCellAddress("AA10")).toBe(true)
    expect(isExcelCellAddress("Z100")).toBe(true)
    expect(isExcelCellAddress("1A")).toBe(false)
    expect(isExcelCellAddress("A0")).toBe(false)
    expect(isExcelCellAddress("AA")).toBe(false)
    expect(isExcelCellAddress("")).toBe(false)
    expect(isExcelCellAddress("A1B2")).toBe(false)
  })
})
