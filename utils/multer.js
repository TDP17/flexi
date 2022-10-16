import multer, { diskStorage } from "multer";

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload only images.", false);
  }
};

let companyStorage = diskStorage({
  destination: "./upload/company/",
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}-${req.body.name}.png`);
  },
});

let productStorage = diskStorage({
  destination: "./upload/product/",
  filename: (req, file, cb) => {
    // Change to req.company_id later when auth
    cb(
      null,
      `${file.fieldname}-${Date.now()}-${req.body.price}-${req.body.name}.png`
    );
  },
});

const uploadCompanyFile = multer({
  storage: companyStorage,
  fileFilter: imageFilter,
});
export const uploadProductFile = multer({
  storage: productStorage,
  fileFilter: imageFilter,
});

export default uploadCompanyFile;
