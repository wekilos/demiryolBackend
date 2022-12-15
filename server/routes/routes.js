const express = require("express");
// const { verify } = require("crypto");
const Func = require("../functions/functions");
const sequelize = require("../../config/db");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cache = require("../../config/node-cache");
const path = require("path");

const multer = require("multer");
// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, path.join(global.rootPath,'uploads'));
//     console.log(file)
//   },
//   filename: function(req, file, cb) {
//     console.log(file,"fil in multer")
//     cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   // reject a file
//   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || true) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   // limits: {
//   //   fileSize: 1024 * 1024 * 15
//   // },
//   fileFilter: fileFilter
// });

// Multer Properties
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(
            new AppError("Not an image! Please upload only images.", 400),
            false
        );
    }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Controllers
const UserControllers = require("../controller/userController");
const AdminControllers = require("../controller/adminController");
const NewsControllers = require("../controller/newsCantroller");
const ContactControllers = require("../controller/contactsControllers");
const OrderControllers = require("../controller/ordersController");
const OrderDocControllers = require("../controller/orderDocsController");
const UserCodesControllers = require("../controller/userCodesController");
// // Routes

router.get("/users_tb", UserControllers.users_tb);
router.get("/admin_tb", AdminControllers.admin_tb);
router.get("/news_tb", NewsControllers.news_tb);
router.get("/contacts_tb", ContactControllers.contacts_tb);
router.get("/order_tb", OrderControllers.orders_tb);
router.get("/orderDoc_tb", OrderDocControllers.orderDocs_tb);
router.get("/userCodes_tb", UserCodesControllers.userCodes_tb);

// User Routes

// router.get("/user/type",cache.get,UserTypeControllers.getUserType,cache.set);
router.get("/user/all", cache.get, UserControllers.getAllUser, cache.set);
router.get("/user/one/:id", cache.get, UserControllers.getOneUser, cache.set);
router.post("/user/create", UserControllers.create);
router.post("/user/login", UserControllers.login);
router.patch("/user/update", UserControllers.update);
router.patch("/user/forgot", UserControllers.forgot);
router.patch("/user/disActive/:id", UserControllers.disActive);
router.patch("/user/Active/:id", UserControllers.Active);

router.post("/send/code", UserCodesControllers.SendCode);
router.post("/check/code", UserCodesControllers.CheckCode);

//   Admin Routers
router.post("/admin/create", AdminControllers.create);
router.post("/admin/login", AdminControllers.login);
router.patch("/admin/update", AdminControllers.update);
router.patch("/admin/disActive/:id", AdminControllers.disActive);
router.patch("/admin/Active/:id", AdminControllers.Active);

//  News Routers
router.get("/news", NewsControllers.getAll);
router.get("/news/:id", NewsControllers.getOne);
router.post("/news/create", NewsControllers.create);
router.patch("/news/disActive/:id", NewsControllers.DisActiveted);
router.patch("/news/active/:id", NewsControllers.Activeted);
router.patch("/news/update", NewsControllers.update);
router.post("/news/update/file", NewsControllers.updateFile);
router.delete("/news/delete/:id", NewsControllers.Delete);

// Send Mail
router.get("/contact/all", ContactControllers.AllMessages);
router.post("/contact/send", ContactControllers.ContactSend);
router.post("/contact/recaptcha", ContactControllers.recaptcha);
router.post("/contact/response", ContactControllers.SendResponse);
router.delete("/contact/delete/:id", ContactControllers.Delete);

// Order
router.get("/order/all", OrderControllers.getAllOrders);
router.get("/order/allDisActive", OrderControllers.getAllDisActiveOrders);
router.get("/order/all/:UserId", OrderControllers.getAllOrdersOneUser);
router.post("/order/create", OrderControllers.createOrder);
router.post("/order/make", OrderControllers.makeOrder);
router.post("/order/payment", OrderControllers.makePayment);
router.patch("/order/cancel/:id", OrderControllers.CancelOrder);
router.patch("/order/disCancel/:id", OrderControllers.DisCancelOrder);

// For Token

function verifyToken(req, res, next) {
    const bearerHeader =
        req.headers["authorization"] || req.headers["Authorization"];
    if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];

        jwt.verify(bearerToken, Func.Secret(), (err, authData) => {
            if (err) {
                res.json("err");
                console.log(err);
            } else {
                req.id = authData.id;
            }
        });
        next();
    } else {
        res.send("<center><h2>This link was not found! :(</h2></center>");
    }
}

module.exports = router;
