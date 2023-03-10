import fs from 'fs'
import chalk from 'chalk'
import { uploadS3 } from './uploadS3'
import { execute } from '../../../utils/execute'
import updateFileRecord from '../../../databaseOperations/updateFileRecord'

export const createCar = async (fileId: string, fileName: string) => {
  const log = console.log
  try {
    // Create CAR
    const car: any = await execute(
      `generate-car --single -i ${process.cwd()}/uploads/${fileId}/${fileName} -o ${process.cwd()}/carGenerated -p ${process.cwd()}`
    )
    const jsonResponse = JSON.parse(car)

    // Push CAR to S3
    const pushToS3 = await uploadS3(jsonResponse['PieceCid'])
    if(!pushToS3){
      throw new Error("Failed to save file to s3")
    }

    // Create DB record
    const _ = await updateFileRecord({
      id: fileId,
      payloadCid: jsonResponse['DataCid'],
      pieceCid: jsonResponse['PieceCid'],
      pieceSize: jsonResponse['PieceSize'],
      fileStatus: 'CAR Created',
    })

    // Remove Uploaded file
    fs.rmSync(`${process.cwd()}/uploads/${fileId}`, { recursive: true })
    // Remove car file from disk
    fs.rmSync(`${process.cwd()}/carGenerated/${jsonResponse['PieceCid']}`, { recursive: true })
    return
  } catch (error) {
    log(chalk.red('Error creating car: ') + error)
    return
  }
}
