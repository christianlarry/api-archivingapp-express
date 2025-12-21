import { ReadStream } from "fs";

export interface IStorageService {
  upload(file: Express.Multer.File, path: string): Promise<string>;
  delete(path: string): Promise<void>;
  getFileStream(path: string): Promise<ReadStream>;
  exists(path: string): Promise<boolean>;
}
