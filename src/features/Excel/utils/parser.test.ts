import { Parser } from "./parser"
import { Token, tokenizer } from "./tokenizer"

describe("Parser", () => {
  describe("変数を含まない算術演算ができる", () => {
    type TestCase = {
      label: string
      tokens: Token[]
      expected: number
    }
    const testCases: TestCase[] = [
      {
        label: "1 + 2",
        expected: 3,
        tokens: [
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
        label: "(3 + 4) * 5",
        expected: 35,
        tokens: [
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
        label: "3 / 5 * 10",
        expected: 6,
        tokens: [
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
        label: "-4 - 5",
        expected: -9,
        tokens: [
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
        label: "SUM(1, 5, 8)",
        expected: 14,
        tokens: [
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
        label: "AVERAGE(3, 12, 15)",
        expected: 10,
        tokens: [
          {
            kind: "RESERVED",
            expr: "AVERAGE",
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
            value: 12,
          },
          {
            kind: "RESERVED",
            expr: ",",
          },
          {
            kind: "NUM",
            value: 15,
          },
          {
            kind: "RESERVED",
            expr: ")",
          },
        ],
      },
      {
        label: "SUM(1, SUM(3, 4))",
        expected: 8,
        tokens: [
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
        label: "ROUND(123.456, 0)",
        expected: 123,
        tokens: [
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
        label: "ROUND(123.456, 1)",
        expected: 123.5,
        tokens: [
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
            value: 1,
          },
          {
            kind: "RESERVED",
            expr: ")",
          },
        ],
      },
    ]
    test.each(testCases)("$label", (testCase) => {
      const parser = new Parser(
        "",
        function () {
          throw new Error("Unexpected function call.")
        },
        testCase.tokens
      )
      const tree = parser.parse()
      console.log(tree)
      expect(tree.eval()).toBe(testCase.expected)
    })
  })

  describe("セルを含む数式を適切な木に変換できる", () => {
    type TestCase = {
      label: string
      input: string
      expected: number
      getFormula: (address: string) => string
    }
    const testCases: TestCase[] = [
      {
        label: "2段階でネストしてセルにアクセスする場合",
        input: "=B4",
        expected: 12,
        getFormula: function (address) {
          if (address === "B4") {
            return "=B3 * 2"
          }
          if (address === "B3") {
            return "6"
          }
          throw new Error("Unexpected reach.")
        },
      },
      {
        label: "一つのセルが複数のセルを参照する場合",
        input: "=(B1 + B2) * B3",
        expected: 33,
        getFormula: function (address) {
          if (address === "B1") {
            return "5"
          }
          if (address === "B2") {
            return "6"
          }
          if (address === "B3") {
            return "=1 + 2"
          }
          throw new Error("Unexpected case.")
        },
      },
    ]

    test.each(testCases)("$label", (testCase) => {
      const tokens = tokenizer(testCase.input)
      const parser = new Parser("", testCase.getFormula, tokens)
      const tree = parser.parse()
      console.log(tree)
      expect(tree.eval()).toBe(testCase.expected)
    })
  })
})
