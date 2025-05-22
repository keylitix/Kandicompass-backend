import { diskStorage } from 'multer';

export const multerDiskUploader = dest => {
  return diskStorage({
    destination: dest,
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname.replace(/ /g, ''));
    },
  });
};
