// This file would be used to start the Python server in development
// It's not needed for the Vercel deployment, as the Python API would be deployed as serverless functions

import { spawn } from "child_process"
import path from "path"

export function startPythonServer() {
  const pythonPath = process.env.PYTHON_PATH || "python"
  const scriptPath = path.join(process.cwd(), "api", "main.py")

  const pythonProcess = spawn(pythonPath, [scriptPath])

  pythonProcess.stdout.on("data", (data) => {
    console.log(`Python server: ${data}`)
  })

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python server error: ${data}`)
  })

  pythonProcess.on("close", (code) => {
    console.log(`Python server exited with code ${code}`)
  })

  return pythonProcess
}
