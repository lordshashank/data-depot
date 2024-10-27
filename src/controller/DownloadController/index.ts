import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import config from '../../config' // Assuming config is exported from this path
import type { NextFunction, Response } from 'express'

export const download_car_head = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const fileName = req.query.fileId
    const filePath = path.join(config.carPath, fileName)

    const resolvedPath = path.resolve(filePath)

    if (!isPathInside(config.carPath, resolvedPath)) {
      res.status(400).send('Invalid file path')
      return
    }

    chalk.yellow(`Miner getting file metadata: ${req.query.fileId}`)

    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.status(404).send('File not found')
        } else {
          res.status(500).send('Internal server error')
        }
        console.log(
          chalk.red(`Error: Failed to get metadata- ${req.query.fileId}`)
        )
        return
      }

      res.setHeader('Content-Disposition', 'attachment; filename=' + fileName)
      res.setHeader('Content-Length', stats.size.toString())
      res.setHeader('Last-Modified', stats.mtime.toUTCString())
      res.setHeader('Content-Type', 'application/octet-stream')
      res.status(200).end()
    })
  } catch (error: any) {
    console.log(chalk.red(`Error: Failed to get metadata- ${req.query.fileId}`))
    next(error)
  }
}

export const download_car = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const fileName = `${req.query.fileId}`
    const filePath = path.join(config.carPath, fileName)

    const resolvedPath = path.resolve(filePath)

    if (!isPathInside(config.carPath, resolvedPath)) {
      res.status(400).send('Invalid file path')
      return
    }

    console.log(chalk.yellow(`Miner downloading file: ${req.query.fileId}`))

    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.status(404).send('File not found')
        } else {
          res.status(500).send('Internal server error')
        }
        console.log(chalk.red(`Error: Failed to download- ${req.query.fileId}`))
        return
      }

      const fileStream = fs.createReadStream(filePath)
      res.setHeader('Content-Disposition', 'attachment; filename=' + fileName)
      res.setHeader('Content-Length', stats.size.toString())
      res.setHeader('Content-Type', 'application/octet-stream')
      res.status(200)
      fileStream.pipe(res)
    })
  } catch (error: any) {
    console.log(chalk.red(`Error: Failed to download- ${req.query.fileId}`))
    next(error)
  }
}

const isPathInside = (parent: string, child: string) => {
  const relative = path.relative(parent, child)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
