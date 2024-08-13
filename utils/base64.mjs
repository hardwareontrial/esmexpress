import pc from 'picocolors';
import fs from 'fs/promises';

export async function encodeBase64FilePath(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const base64String = await encodeBase64FileBuffer(fileBuffer);
    return base64String;
  } catch (error) {
    console.log(pc.bgRed(pc.white(`UTILS-encodeBase64FilePath: ${error.message || error}`)));
    throw error;
  }
}

export async function encodeBase64FileBuffer(fileBuffer) {
  try {
    const base64String = fileBuffer.toString('base64');
    return base64String;
  } catch (error) {
    console.log(pc.bgRed(pc.white(`UTILS-encodeBase64FileBuffer: ${error.message || error}`)));
    throw error;
  }
}

export async function decodeBase64ToBuffer(base64String) {
  try {
    const base64Data = base64String.replace(/^data:.+;base64,/,'');
    const fileBuffer = Buffer.from(base64Data, 'base64');
    return fileBuffer;
  } catch (error) {
    console.log(pc.bgRed(pc.white(`UTILS-decodeBase64: ${error.message || error}`)));
    throw error;
  }
}

export async function decodeBase64ToFile(base64String, filePath) {
  // filePath = /path/to/file/filename
  try {
    const fileBuffer = await decodeBase64ToBuffer(base64String);
    await fs.writeFile(filePath, fileBuffer);
    return filePath;
  } catch (error) {
    console.log(pc.bgRed(pc.white(`UTILS-decodeBase64: ${error.message || error}`)));
    throw error;
  }
}