import { createCar } from './helper/createCar'
import { NextFunction, Response } from 'express'
import createFileRecord from '../../databaseOperations/createFileRecord'

export const upload_files = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const timestamp = Date.now()
    for (let i = 0; i < req.files.length; i++) {
      const record = {
        id: req.files[i].destination.split('/')[1],
        userName: req.user.userName,
        fileName: req.files[i].originalname,
        fileSize: req.files[i].size,
        mimeType: req.files[i].mimetype,
        payloadCid: '',
        pieceCid: '',
        pieceSize: 0,
        fileStatus: 'Creating CAR',
        createdAt: timestamp,
        lastUpdate: timestamp
      }
      const createRecord = await createFileRecord(record)
      createCar(req.files[i].destination.split('/')[1])
    }

    res.status(200).send({
      message: 'Uploaded the files successfully',
    })
  } catch (err: any) {
    if (err.code == 'LIMIT_FILE_SIZE') {
      return res.status(500).send({
        message: 'File size cannot be larger than 100GB!',
      })
    }
    next(err)
  }
}
