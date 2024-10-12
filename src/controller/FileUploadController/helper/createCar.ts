import fs from 'fs'
import chalk from 'chalk'
import config from '../../../config'
// import { uploadS3 } from './uploadS3'
import { execute } from '../../../utils/execute'
import updateFileRecord from '../../../databaseOperations/updateFileRecord'

export const createCar = async (fileId: string, fileName: string) => {
  const log = console.log
  try {
    // Create CAR
    const nameFormat = fileName.replace(/ /g, '\\ ')
    const uploadPathFormat = config.uploadPath.replace(/ /g, '\\ ')
    const carPathFormat = config.carPath.replace(/ /g, '\\ ')
    const car: any = await execute(
      `generate-car --single -i ${uploadPathFormat}/${fileId}/${nameFormat} -o ${carPathFormat} -p ${uploadPathFormat}/${fileId}/${nameFormat}`
    )
    const jsonResponse = JSON.parse(car)
    const carFilePath = `${carPathFormat}/${jsonResponse['PieceCid']}.car`
    const newCarFilePath = `${carPathFormat}/${fileId}.car`
    let carSize = 0
    // Get the size of the .car file
    fs.stat(carFilePath, (err, stats) => {
      if (err) {
        console.error('Error getting file size:', err)
        return
      }
      carSize = stats.size
      console.log(`Size of ${carFilePath}: ${stats.size} bytes`)
    })

    // Rename the file from PieceCid.car to fileId.car
    fs.rename(carFilePath, newCarFilePath, (err) => {
      if (err) {
        console.error('Error renaming file:', err)
        return
      }
      console.log(`File renamed from ${carFilePath} to ${newCarFilePath}`)
    })

    if (carSize === 0) {
      console.error('Error getting file size:', carFilePath)
      return
    }
    // // Push CAR to S3
    // const pushToS3 = await uploadS3(jsonResponse['PieceCid'], fileId)
    // if (!pushToS3) {
    //   throw new Error('Failed to save file to s3')
    // }

    // Create DB record
    const _ = await updateFileRecord({
      id: fileId,
      payloadCid: jsonResponse['Ipld']['Link'][0].Hash,
      pieceCid: jsonResponse['PieceCid'],
      carSize: carSize,
      pieceSize: jsonResponse['PieceSize'],
      fileStatus: 'CAR Created',
    })

    // Remove Uploaded file
    fs.rmSync(`${config.uploadPath}/${fileId}`, { recursive: true })
    // Remove car file from disk
    // fs.rmSync(`${config.carPath}/${jsonResponse['PieceCid']}.car`, {
    //   recursive: true,
    // })
    return
  } catch (error) {
    log(chalk.red('Error creating car: ') + error)
    return
  }
}
