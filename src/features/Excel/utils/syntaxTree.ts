import { roundToPlaces, unreachable } from "@/utils"
import { ExcelFuncName } from "./parser"

const nodeTypesList = ["ADD", "SUB", "MUL", "DIV", "LITERAL", "FUNC"] as const
type NodeType = (typeof nodeTypesList)[number]

export class SyntaxTreeNode {
  public id: string = crypto.randomUUID()
  private calculatedValue: number | undefined
  constructor(
    public nodeType: NodeType,
    public children: SyntaxTreeNode[],
    private value: number | undefined,
    private funcName: ExcelFuncName | undefined,
    private cellAddress: string | undefined
  ) {}

  public getCalculatedValue(): number {
    if (this.nodeType === "LITERAL") {
      throw Error("Not allowed to get calculated value of non-functional node.")
    }
    if (this.calculatedValue === undefined) {
      throw new Error(
        `The value has not been calculated yet. (address: ${this.cellAddress})`
      )
    }
    return this.calculatedValue
  }

  public getNodeType(): NodeType {
    return this.nodeType
  }

  public getValue(): number {
    if (this.nodeType !== "LITERAL") {
      throw new Error("Not allowed to get value of non-literal node.")
    }
    if (this.value === undefined) {
      throw new Error("Node is literal but has no value.")
    }
    return this.value
  }

  public getAddress(): string | undefined {
    return this.cellAddress
  }

  public setAddress(address: string): SyntaxTreeNode {
    this.cellAddress = address
    return this
  }

  public eval(
    addressToValueMap: Map<string, number> | undefined,
    onCalc: ((address: string, result: number) => void) | undefined
  ): number {
    const children = this.children.map((c) => c.eval(addressToValueMap, onCalc))
    const calculatedValue = ((): number => {
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
          const customSetValue =
            this.cellAddress !== undefined
              ? addressToValueMap?.get(this.cellAddress)
              : undefined
          if (this.value === undefined && customSetValue === undefined) {
            throw new Error("NodeType is LITERAL but no value is set.")
          }
          return customSetValue ?? this.value ?? unreachable()
        }
        case "FUNC": {
          switch (this.funcName) {
            case undefined: {
              throw new Error("Function but function name is not given")
            }
            case "SUM": {
              return this.children
                .map((c) => c.eval(addressToValueMap, onCalc))
                .reduce((acc, cur) => acc + cur)
            }
            case "AVERAGE": {
              const sum = this.children
                .map((c) => c.eval(addressToValueMap, onCalc))
                .reduce((acc, cur) => acc + cur)
              return sum / this.children.length
            }
            case "ROUND": {
              const value = this.children[0]?.eval(addressToValueMap, onCalc)
              const places = this.children[1]?.eval(addressToValueMap, onCalc)
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
    })()

    if (addressToValueMap === undefined && onCalc === undefined) {
      // 元の計算結果は保持したい
      this.calculatedValue = calculatedValue
    }

    // もしアドレスが存在して、かつonCalcが与えられていたら呼ぶ
    if (this.cellAddress !== undefined) {
      onCalc?.(this.cellAddress, calculatedValue)
    }
    return calculatedValue
  }
}
