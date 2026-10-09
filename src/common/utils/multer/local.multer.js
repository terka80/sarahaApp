import multer from "multer";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { BadException } from "../../exceptions/error.exception.js";

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  filles: ["application/pdf", "application/json"],
};
export const localFileUpload = ({ maxFileSize = 5 } = {}) => {

  const storage = multer.memoryStorage();


  return multer({
    storage,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
  });
};

export const processFile = async ({
  customPath = "general",
  file,
  validation = [],
}) => {
  const result = await fileTypeFromBuffer(file.buffer);
  console.log({ result });

  if (!result || !validation.includes(result.mime)) {
    throw BadException("invalidFile format");
  } else {
    await mkdir(resolve(`./assets/${customPath}`), { recursive: true });
    const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`;

    await writeFile(resolve(`./${uniqueFilePath}`), file.buffer);
    file.finalPath = uniqueFilePath;
  }
  return file;
};
export const processFiles = async ({
  customPath,
  files = [],
  validation = [],
}) => {
  const assets = [];

  for (const file of files) {
    const uploadFile = await processFile({ customPath, file, validation });
    assets.push(uploadFile);
  }
  return assets;
};
export const processFields = async ({
  customPath,
  fields = {},
  validation = [],
}) => {
  const assets = [];

  for (const field of Object.keys(fields)) {
    const files = await processFile({
      customPath,
      file: fields[field],
      validation,
    });
    assets.push({ field, files });
  }
  return assets;
};

export const processMulterUpload = async ({
  req,
  customPath = "general",
  validation = [],
}) => {
  if (req.file) {
    await processFile({ customPath, file: req.file, validation });
  } else if (Array.isArray(req.files)) {
    await processFiles({ customPath, files: req.files, validation });
  } else if (
    typeof req.files == "object" &&
    Object.keys(req.files ?? {})?.length
  ) {
    await processFields({ customPath, fields: req.files, validation });
  }
};


