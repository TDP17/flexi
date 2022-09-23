import { Router } from "express";

import logger from "../utils/logger.js";
import { uploadProductFile } from "../utils/multer.js";
import deleteFromFs from "../utils/deleteFromFs.js";
import Product from "../models/products.js";
import Company from "../models/company.js";

const router = Router();

router.get("/", async (req, res) => {
    logger.info("On get all companies route");

    try {
        const companies = await Company.findAll({ exclude: "password" });
        res.status(200).json({ companies })
    } catch (error) {
        logger.error(error);
    }
});

// /**
//  * @TODO Decide between this and the one below
//  */
// router.get("/assoc/:company_id", async (req, res) => {
//     logger.info("On get company with products for specific");

//     // @TODO verify this with request.company_id later, else return unauthorized
//     const { company_id } = req.params;

//     try {
//         const company = await Company.findOne({ where: { id: company_id }, include: Product });
//         if (company) {
//             delete company.dataValues.password;
//             res.status(200).json({ company })
//         }
//         else res.status(400).json({ error: "Company with given id not found" })
//     } catch (error) {
//         logger.error(error);
//     }
// });

router.get("/:id", async (req, res) => {
    logger.info("On get company by id route");

    const { id } = req.params;

    try {
        const company = await Company.findByPk(id, { exclude: "password" });
        if (company && (company !== undefined))
            res.status(200).json({ company })
        else res.status(400).json({ error: "No company with given id found" })
    } catch (error) {
        logger.error(error);
    }
});

// router.post("/", uploadProductFile.single('image'), async (req, res) => {
//     logger.info("On company creation route");

//     // @TODO get this with request.company_id later, else return unauthorized
//     const { company_id, name, price } = req.body;
//     const image = req.file;

//     try {
//         if (image !== undefined) {
//             const product = await Product.create({ name, price, company_id, image: image.path })
//             res.status(201).json({ message: "Product Created", product });
//         }
//         else {
//             await deleteFromFs(image.path);
//             res.status(400).json({ error: "Image not found" })
//         }
//     } catch (error) {
//         logger.error(error);

//         await deleteFromFs(image.path);
//         res.status(400).json({ error });
//     }
// });

const test = uploadProductFile.array([
    { name: 'banner', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
])

router.post("/", test, (req, res) => {
    const { banner, logo } = req.files;
    cloudinary.uploader.upload(banner.path, result => {

        // This will return the output after the code is exercuted both in the terminal and web browser
        // When successful, the output will consist of the metadata of the uploaded file one after the other. These include the name, type, size and many more.
        console.log(result)
        if (result.public_id) {

            // The results in the web browser will be returned inform of plain text formart. We shall use the util that we required at the top of this code to do this.
            res.writeHead(200, { 'content-type': 'text/plain' });
            res.write('received uploads:\n\n');
            res.end(util.inspect({ fields: fields, files: files }));
        }
    });
});

export default router;