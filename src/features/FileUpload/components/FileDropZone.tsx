"use client"

import { IdentifiableFile } from "@/features/FileUpload/utils/file"
import { Chip, Paper, Typography } from "@mui/material"
import React from "react"
import { useDropzone } from "react-dropzone"
import DeleteIcon from "@mui/icons-material/Delete"

type FileDropZoneProps = {
  files: IdentifiableFile[]
  setFiles: React.Dispatch<React.SetStateAction<IdentifiableFile[]>>
}

export default function FileDropZone({ files, setFiles }: FileDropZoneProps) {
  const onDrop = React.useCallback(
    (files: File[]) => {
      setFiles(
        files.map((f) => ({
          id: crypto.randomUUID(),
          content: f,
        }))
      )
    },
    [setFiles]
  )
  const onDelete = React.useCallback(
    (id: string) => setFiles((files) => files.filter((f) => f.id !== id)),
    [setFiles]
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
  return (
    <React.Fragment>
      <Paper {...getRootProps()} elevation={3} sx={{ m: 4 }}>
        <input {...getInputProps()} />
        <Typography p={10} fontSize={20} align="center">
          {isDragActive
            ? "ファイルをドロップしてください"
            : "ここにファイルをドラッグ＆ドロップするか、クリックしてファイルを選択してください"}
        </Typography>
      </Paper>
      {files.map((file) => (
        <Chip
          key={file.id}
          label={file.content.name}
          deleteIcon={<DeleteIcon />}
          onDelete={() => onDelete(file.id)}
        />
      ))}
    </React.Fragment>
  )
}
