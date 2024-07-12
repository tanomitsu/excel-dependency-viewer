import { SyntaxTreeNode } from "./syntaxTree"
import { Token, tokenizer } from "./tokenizer"

const excelFuncNamesList = ["SUM", "AVERAGE", "ROUND"] as const
const excelFuncNames = new Set(excelFuncNamesList)
export type ExcelFuncName = (typeof excelFuncNamesList)[number]

export class Parser {
  private position: number = 0
  constructor(
    private rootAddress: string,
    private getFormula: (address: string) => string,
    /**
     * 基本的に外部から与えたtokensで初期化しない。
     * テストのために一応可能としている
     */
    private tokens: Token[] = []
  ) {}

  private static createNumberNode(
    value: number,
    cellAddress: string | undefined
  ): SyntaxTreeNode {
    return new SyntaxTreeNode("LITERAL", [], value, undefined, cellAddress)
  }

  /**
   * positionが指すtokenが数値の場合trueを返す。
   * @returns
   */
  private isCurNumber(): boolean {
    const token = this.tokens[this.position]
    if (token === undefined) {
      return false
    }
    return token.kind === "NUM"
  }

  /**
   * positionが指すtokenが想定した記号であった場合、tokenを1つ読み進めてtrueを返す。
   * それ以外の場合、falseを返す。
   * @param expected
   */
  private consume(expected: string): boolean {
    const token = this.tokens[this.position]
    if (token === undefined) {
      return false
    }
    if (token.kind !== "RESERVED" || token.expr !== expected) {
      return false
    }
    this.position++
    return true
  }

  private consumeFuncName(): string | undefined {
    const token = this.tokens[this.position]
    if (token === undefined) {
      return undefined
    }
    if (
      token.kind !== "RESERVED" ||
      !excelFuncNames.has(token.expr as ExcelFuncName)
    ) {
      return undefined
    }
    this.position++
    return token.expr
  }

  /**
   * positionが指すtokenが想定した記号であった場合、tokenを1つ読み進める。
   * それ以外の場合、エラーを返す。
   * @param expected
   */
  private expect(expected: string): void {
    const token = this.tokens[this.position]
    if (token === undefined) {
      throw new Error(`Expected ${expected}, but got EOF.`)
    }
    if (token.kind === "NUM") {
      throw new Error(`Expected ${expected}, but got ${token.value}`)
    }
    if (token.expr !== expected) {
      throw new Error(`Expected ${expected}, but got ${token.expr}`)
    }
    this.position++
    return
  }

  private expectNumber(): number {
    const token = this.tokens[this.position]
    if (token === undefined) {
      throw new Error(`Expected number, but got EOF.`)
    }
    if (token.kind === "RESERVED") {
      throw new Error(`Expected number, but got ${token.expr}`)
    }
    this.position++
    return token.value
  }

  private expectReserved(): string {
    const token = this.tokens[this.position]
    if (token === undefined) {
      throw new Error(`Expected number, but got EOF.`)
    }
    if (token.kind === "NUM") {
      throw new Error(`Expected number, but got ${token.value}`)
    }
    this.position++
    return token.expr
  }

  private expr(): SyntaxTreeNode {
    return this.add()
  }

  private add(): SyntaxTreeNode {
    let node = this.mul()
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    while (true) {
      if (this.consume("+")) {
        node = new SyntaxTreeNode(
          "ADD",
          [node, this.mul()],
          undefined,
          undefined,
          undefined
        )
      } else if (this.consume("-")) {
        node = new SyntaxTreeNode(
          "SUB",
          [node, this.mul()],
          undefined,
          undefined,
          undefined
        )
      } else {
        return node
      }
    }
  }

  private mul(): SyntaxTreeNode {
    let node: SyntaxTreeNode = this.unary()

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    while (true) {
      if (this.consume("*")) {
        node = new SyntaxTreeNode(
          "MUL",
          [node, this.unary()],
          undefined,
          undefined,
          undefined
        )
      } else if (this.consume("/")) {
        node = new SyntaxTreeNode(
          "DIV",
          [node, this.unary()],
          undefined,
          undefined,
          undefined
        )
      } else {
        return node
      }
    }
  }

  /**
   * 単行演算子を含む
   */
  private unary(): SyntaxTreeNode {
    if (this.consume("-")) {
      return new SyntaxTreeNode(
        "SUB",
        [Parser.createNumberNode(0, undefined), this.primary()],
        undefined,
        undefined,
        undefined
      )
    }
    return this.primary()
  }

  private primary(): SyntaxTreeNode {
    if (this.isCurNumber()) {
      // 数値リテラル
      return Parser.createNumberNode(this.expectNumber(), undefined)
    }
    if (this.consume("(")) {
      // "(" expr ")"
      const node = this.add()
      this.expect(")")
      return node
    }
    const funcName = this.consumeFuncName()
    if (funcName !== undefined) {
      // 関数呼び出し
      this.expect("(")
      const args = this.args()
      this.expect(")")
      return new SyntaxTreeNode(
        "FUNC",
        args,
        undefined,
        funcName as ExcelFuncName,
        undefined
      )
    }
    // セルアドレス
    return this.cell()
  }

  private args(): SyntaxTreeNode[] {
    const res: SyntaxTreeNode[] = [this.add()]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    while (true) {
      if (this.consume(",")) {
        res.push(this.add())
        continue
      }
      break
    }
    return res
  }

  private cell(): SyntaxTreeNode {
    const address = this.expectReserved()

    const parser = new Parser(address, this.getFormula)
    parser.init()

    const subTree = parser.expr()
    subTree.setAddress(address)

    return subTree
  }

  /**
   * Usage: Parserインスタンスを作成したら、最初にinit関数を実行する。
   */
  public init(): void {
    const formula = this.getFormula(this.rootAddress)
    const tokens = tokenizer(formula)
    this.tokens = tokens
  }

  public parse(): SyntaxTreeNode {
    return this.expr().setAddress(this.rootAddress)
  }
}
