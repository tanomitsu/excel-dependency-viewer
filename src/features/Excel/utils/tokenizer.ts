import { isNumeric } from "@/utils"

export type Token =
  | {
      // 記号
      kind: "RESERVED"
      expr: string
    }
  | {
      // 数値リテラル
      kind: "NUM"
      value: number
    }

const splitLetters = new Set(["(", ",", ")", "+", "-", "*", "/"])

export function tokenizer(str: string): Token[] {
  if (str[0] === "=") {
    const tokens: Token[] = []
    let token = ""
    for (let i = 1; i < str.length; i++) {
      const char = str[i]!
      if (str[i] === " ") {
        // スペースはスキップ
        continue
      }
      if (splitLetters.has(char)) {
        if (token !== "") {
          if (isNumeric(token)) {
            tokens.push({ kind: "NUM", value: Number(token) })
          } else {
            tokens.push({ kind: "RESERVED", expr: token })
          }
        }
        token = ""
        tokens.push({ kind: "RESERVED", expr: char })
        continue
      }
      token += char
    }
    // 最後に余った文字をtokensに追加
    if (token !== "") {
      if (isNumeric(token)) {
        tokens.push({ kind: "NUM", value: Number(token) })
      } else {
        tokens.push({ kind: "RESERVED", expr: token })
      }
    }
    return tokens
  }
  if (!isNumeric(str)) {
    throw new Error("Provided string is neither formula nor number.")
  }
  return [{ kind: "NUM", value: Number(str) }]
}
