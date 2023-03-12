export interface fileRecord {
  id: string,
  userName: string,
  fileName: string,
  fileSize: number,
  mimeType: string,
  payloadCid: string,
  carSize: number,
  pieceCid: string,
  pieceSize: number,
  fileStatus: string,
  createdAt: number,
  lastUpdate: number,
}

export interface userRecord {
  userName: string,
  dataUploaded: number,
  filesUploaded: number,
  createdAt: number,
  lastUpdate: number,
}

export interface userDataUpdate {
  userName: string,
  dataUploaded: number,
}
