import { Token, tokenizer } from "./tokenizer"

describe("tokenizer", () => {
  type TestCase = {
    label: string
    input: string
    expected: Token[]
  }
  describe("正しい値を返す", () => {
    const testCases: TestCase[] = [
      {
        label: "5",
        input: "5",
        expected: [
          {
            kind: "NUM",
            value: 5,
          },
        ],
      },
      {
        label: "=1 + 2",
        input: "=1 + 2",
        expected: [
          {
            kind: "NUM",
            value: 1,
          },
          {
            kind: "RESERVED",
            expr: "+",
          },
          {
            kind: "NUM",
            value: 2,
          },
        ],
      },
      {
        label: "=(3 + 4) * 5",
        input: "=(3 + 4) * 5",
        expected: [
          {
            kind: "RESERVED",
            expr: "(",
          },
          {
            kind: "NUM",
            value: 3,
          },
          {
            kind: "RESERVED",
            expr: "+",
          },
          {
            kind: "NUM",
            value: 4,
          },
          {
            kind: "RESERVED",
            expr: ")",
          },
          {
            kind: "RESERVED",
            expr: "*",
          },
          {
            kind: "NUM",
            value: 5,
          },
        ],
      },
      {
        label: "=3 / 5 * 10",
        input: "=3 / 5 * 10",
        expected: [
          {
            kind: "NUM",
            value: 3,
          },
          {
            kind: "RESERVED",
            expr: "/",
          },
          {
            kind: "NUM",
            value: 5,
          },
          {
            kind: "RESERVED",
            expr: "*",
          },
          {
            kind: "NUM",
            value: 10,
          },
        ],
      },
      {
        label: "=-4 - 5",
        input: "=-4 - 5",
        expected: [
          {
            kind: "RESERVED",
            expr: "-",
          },
          {
            kind: "NUM",
            value: 4,
          },
          {
            kind: "RESERVED",
            expr: "-",
          },
          {
            kind: "NUM",
            value: 5,
          },
        ],
      },
      {
        label: "=SUM(1, 5, 8)",
        input: "=SUM(1, 5, 8)",
        expected: [
          {
            kind: "RESERVED",
            expr: "SUM",
          },
          {
            kind: "RESERVED",
            expr: "(",
          },
          {
            kind: "NUM",
            value: 1,
          },
          {
            kind: "RESERVED",
            expr: ",",
          },
          {
            kind: "NUM",
            value: 5,
          },
          {
            kind: "RESERVED",
            expr: ",",
          },
          {
            kind: "NUM",
            value: 8,
          },
          {
            kind: "RESERVED",
            expr: ")",
          },
        ],
      },
      {
        label: "=SUM(1, SUM(3, 4))",
        input: "=SUM(1, SUM(3, 4))",
        expected: [
          {
            kind: "RESERVED",
            expr: "SUM",
          },
          {
            kind: "RESERVED",
            expr: "(",
          },
          {
            kind: "NUM",
            value: 1,
          },
          {
            kind: "RESERVED",
            expr: ",",
          },
          {
            kind: "RESERVED",
            expr: "SUM",
          },
          {
            kind: "RESERVED",
            expr: "(",
          },
          {
            kind: "NUM",
            value: 3,
          },
          {
            kind: "RESERVED",
            expr: ",",
          },
          {
            kind: "NUM",
            value: 4,
          },
          {
            kind: "RESERVED",
            expr: ")",
          },
          {
            kind: "RESERVED",
            expr: ")",
          },
        ],
      },
      {
        label: "=ROUND(123.456, 0)",
        input: "=ROUND(123.456, 0)",
        expected: [
          {
            kind: "RESERVED",
            expr: "ROUND",
          },
          {
            kind: "RESERVED",
            expr: "(",
          },
          {
            kind: "NUM",
            value: 123.456,
          },
          {
            kind: "RESERVED",
            expr: ",",
          },
          {
            kind: "NUM",
            value: 0,
          },
          {
            kind: "RESERVED",
            expr: ")",
          },
        ],
      },
      {
        label: "=SUM(A1:A3)",
        input: "=SUM(A1:A3)",
        expected: [
          {
            kind: "RESERVED",
            expr: "SUM",
          },
          {
            kind: "RESERVED",
            expr: "(",
          },
          {
            kind: "RESERVED",
            expr: "A1:A3",
          },
          {
            kind: "RESERVED",
            expr: ")",
          },
        ],
      },
    ]
    test.each(testCases)("$label", (testCase) => {
      const result = tokenizer(testCase.input)
      expect(result).toStrictEqual(testCase.expected)
    })
  })
})
