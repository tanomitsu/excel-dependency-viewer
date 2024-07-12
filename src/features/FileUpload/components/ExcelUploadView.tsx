import React from "react"
import FileDropZone from "./FileDropZone"
import { IdentifiableFile } from "@/features/FileUpload/utils/file"
import { Box, Button, Stack, TextField } from "@mui/material"

type FileDropZoneProps = {
  sheetName: string
  setSheetName: React.Dispatch<React.SetStateAction<string>>
  targetCellAddress: string
  setTargetCellAddress: React.Dispatch<React.SetStateAction<string>>
  files: IdentifiableFile[]
  setFiles: React.Dispatch<React.SetStateAction<IdentifiableFile[]>>
  onNextButtonPush: () => void
}

export default function ExcelUploadView({
  sheetName,
  setSheetName,
  targetCellAddress,
  setTargetCellAddress,
  files,
  setFiles,
  onNextButtonPush,
}: FileDropZoneProps): React.JSX.Element {
  return (
    <>
      <FileDropZone files={files} setFiles={setFiles} />
      <Stack spacing={2} sx={{ px: 4 }}>
        <TextField
          id="sheet-name-input"
          label="シート名"
          variant="standard"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
        />
        <TextField
          id="target-cell-address-input"
          label="解析するセルのアドレス"
          variant="standard"
          value={targetCellAddress}
          onChange={(e) => setTargetCellAddress(e.target.value)}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            size="medium"
            variant="contained"
            sx={{ px: 4 }}
            onClick={onNextButtonPush}
            disabled={files.length === 0}
          >
            次へ
          </Button>
        </Box>
      </Stack>
    </>
  )
}
