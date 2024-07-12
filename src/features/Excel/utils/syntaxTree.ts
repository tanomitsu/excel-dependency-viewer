import { roundToPlaces, unreachable } from "@/utils"
import { ExcelFuncName } from "./parser"

const nodeTypesList = ["ADD", "SUB", "MUL", "DIV", "LITERAL", "FUNC"] as const
type NodeType = (typeof nodeTypesList)[number]

export class SyntaxTreeNode {
  constructor(
    public nodeType: NodeType,
    public children: SyntaxTreeNode[],
    private value: number | undefined,
    private funcName: ExcelFuncName | undefined,
    private cellAddress: string | undefined
  ) {}

  public setAddress(address: string): SyntaxTreeNode {
    this.cellAddress = address
    return this
  }

  public eval(): number {
    const children = this.children.map((c) => c.eval())
    switch (this.nodeType) {
      case "ADD": {
        return children.reduce((acc, cur) => acc + cur)
      }
      case "SUB": {
        return children.reduce((acc, cur) => acc - cur)
      }
      case "MUL": {
        return children.reduce((acc, cur) => acc * cur)
      }
      case "DIV": {
        if (children.some((child, index) => child === 0 && index !== 0)) {
          throw new Error("You cannot divide by")
        }
        return children.reduce((acc, cur) => acc / cur)
      }
      case "LITERAL": {
        if (this.value === undefined) {
          throw new Error("NodeType is LITERAL but no value is set.")
        }
        return this.value
      }
      case "FUNC": {
        switch (this.funcName) {
          case undefined: {
            throw new Error("Function but function name is not given")
          }
          case "SUM": {
            return this.children
              .map((c) => c.eval())
              .reduce((acc, cur) => acc + cur)
          }
          case "AVERAGE": {
            const sum = this.children
              .map((c) => c.eval())
              .reduce((acc, cur) => acc + cur)
            return sum / this.children.length
          }
          case "ROUND": {
            const value = this.children[0]?.eval()
            const places = this.children[1]?.eval()
            if (
              this.children.length !== 2 ||
              value === undefined ||
              places === undefined
            ) {
              throw new Error("ROUND needs two arguments.")
            }
            return roundToPlaces(value, places)
          }
          default: {
            unreachable(this.funcName)
          }
        }
      }
      // eslint-disable-next-line no-fallthrough
      default: {
        unreachable(this.nodeType)
      }
    }
  }
}
