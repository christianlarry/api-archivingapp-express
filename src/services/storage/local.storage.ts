import { IStorageService } from "@/interfaces/storage.interface";
import fs from "fs";
import path from "path";
import { ReadStream } from "fs";

export class LocalStorageService implements IStorageService {
  async upload(file: Express.Multer.File, uploadPath: string): Promise<string> {
    const dir = path.dirname(uploadPath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Move file
    // Note: Since we are likely using Multer memory storage or temp file, 
    // we need to write the buffer or move the file.
    // Assuming Multer MemoryStorage for now based on typical patterns, 
    // but if DiskStorage is used, we might just rename.
    // Let's implement a safe write that handles both buffer and stream if needed,
    // but typically express-multer passes a buffer if memory storage.

    if (file.buffer) {
      await fs.promises.writeFile(uploadPath, file.buffer);
    } else if (file.path) {
      // If it's already on disk (temp), move it
      await fs.promises.rename(file.path, uploadPath);
    } else {
      throw new Error("File content not found (neither buffer nor temp path)");
    }

    return uploadPath;
  }

  async delete(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async getFileStream(filePath: string): Promise<ReadStream> {
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }
    return fs.createReadStream(filePath);
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}
