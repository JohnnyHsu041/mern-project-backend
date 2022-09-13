import multer from "multer";
import { v4 as uuidv4 } from "uuid";

interface mime {
    [props: string]: string;
}

const MIME_TYPE_MAP: mime = {
    "images/png": "png",
    "images/jpg": "jpg",
    "images/jpeg": "jpeg",
};

const fileUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "../uploads/images");
        },
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype];
            cb(null, `${uuidv4()}.${ext}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        // let error = isValid ? null : new Error("Invalid mime type");
        cb(null, isValid);
    },
});

export default fileUpload;
