"use client"

import Excel from "exceljs"
import ExcelUploadView from "@/features/FileUpload/components/ExcelUploadView"
import { IdentifiableFile } from "@/features/FileUpload/utils/file"
import { unreachable } from "@/utils"
import {
  Alert,
  AlertProps,
  Box,
  CircularProgress,
  Paper,
  Snackbar,
  SnackbarOrigin,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material"
import React from "react"
import { CellData } from "@/features/Excel/types"
import { Parser } from "@/features/Excel/utils/parser"
import { SyntaxTreeNode } from "@/features/Excel/utils/syntaxTree"

const steps = ["Excelファイルをアップロード", "依存関係を確認"]

type SnackState = SnackbarOrigin & {
  isOpen: boolean
  message: string
  severity: AlertProps["severity"]
}

export default function Home(): React.JSX.Element {
  const [activeStep, setActiveStep] = React.useState<0 | 1>(0)
  const [sheetName, setSheetName] = React.useState("")
  const [targetCellAddress, setTargetCellAddress] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [snackState, setSnackState] = React.useState<SnackState>({
    isOpen: false,
    message: "",
    vertical: "top",
    horizontal: "center",
    severity: "error",
  })
  const [files, setFiles] = React.useState<IdentifiableFile[]>([])
  const [syntaxTree, setSyntaxTree] = React.useState<
    SyntaxTreeNode | undefined
  >(undefined)

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ): void => {
    if (reason === "clickaway") {
      return
    }

    setSnackState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  const loadExcelFile = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const file = files[0]
      if (file === undefined) {
        setSnackState((prev) => ({
          ...prev,
          isOpen: true,
          message: "ファイルがアップロードされていません。",
          severity: "error",
        }))
        return
      }
      const workbook = new Excel.Workbook()
      const arrayBuffer = await file.content.arrayBuffer()

      await workbook.xlsx.load(arrayBuffer)
      const worksheet = workbook.getWorksheet(sheetName)

      if (worksheet === undefined) {
        setSnackState((prev) => ({
          ...prev,
          isOpen: true,
          message: `シートが見つかりません。(${sheetName})`,
          severity: "error",
        }))
        return
      }

      const addressToCellMap = new Map<string, CellData>()

      worksheet.eachRow({ includeEmpty: false }, (row) => {
        row.eachCell({ includeEmpty: false }, (cell) => {
          if (cell.type === Excel.ValueType.Number) {
            addressToCellMap.set(cell.address, {
              value: cell.value as number,
              formula: undefined,
            })
          } else if (cell.type === Excel.ValueType.Formula) {
            const formulaCell = cell.value as Excel.CellFormulaValue
            addressToCellMap.set(cell.address, {
              // TODO: 数値以外の計算結果も対応する
              value: formulaCell.result as number,
              formula: formulaCell.formula,
            })
          } else {
            setSnackState((prev) => ({
              ...prev,
              isOpen: true,
              message: `数値セルでも関数セルでもないものが含まれています。`,
              severity: "error",
            }))
            return
          }
        })
      })

      const addressToFormula = (address: string): string => {
        const cell = addressToCellMap.get(address)
        if (cell === undefined) {
          console.log(`cell[${address}] = undefined`)
          // TODO: 仕様を考える
          return "0"
        }
        if (cell.formula !== undefined) {
          // FIXME: 結合する必要がないように変える
          return `=${cell.formula}`
        }
        return cell.value.toString()
      }

      const parser = new Parser(targetCellAddress, addressToFormula)
      parser.init()

      const tree = parser.parse()

      setSyntaxTree(tree)

      setSnackState((prev) => ({
        ...prev,
        isOpen: true,
        message: "ファイルのパースに成功しました。",
        severity: "success",
      }))
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [files, sheetName, targetCellAddress])
  return (
    <main>
      <Snackbar
        anchorOrigin={{
          vertical: snackState.vertical,
          horizontal: snackState.horizontal,
        }}
        open={snackState.isOpen}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={snackState.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackState.message}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          m: 0,
        }}
      >
        <Paper elevation={3} sx={{ w: "100%", px: 16, py: 4, mx: 0 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>
                  <Typography fontSize="large">{label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
        {((): React.JSX.Element => {
          switch (activeStep) {
            case 0:
              return (
                <ExcelUploadView
                  sheetName={sheetName}
                  setSheetName={setSheetName}
                  targetCellAddress={targetCellAddress}
                  setTargetCellAddress={setTargetCellAddress}
                  files={files}
                  setFiles={setFiles}
                  onNextButtonPush={() => {
                    setActiveStep(1)
                    loadExcelFile()
                  }}
                />
              )
            case 1:
              return isLoading || syntaxTree === undefined ? (
                <Box sx={{ display: "flex" }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Typography>{JSON.stringify(syntaxTree)}</Typography>
              )
            default:
              return unreachable(activeStep)
          }
        })()}
      </Box>
    </main>
  )
}
