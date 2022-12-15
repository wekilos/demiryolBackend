var Sequelize = require("sequelize");
var axios = require("axios");
var sequelize = require("../../config/db");
const mailSend = require("../functions/mailSend");
const Contacts = require("../models/contacts");
const Users = require("../models/users");

const contacts_tb = async (req, res) => {
    const response = await sequelize
        .sync()
        .then(function () {
            const data = Contacts.findAll();
            console.log("connection connected");
            return data;
        })
        .catch((err) => {
            return err;
        });
    res.json(response);
};

const AllMessages = async (req, res) => {
    const { came } = req.query;
    Contacts.findAll({
        include: [
            {
                model: Users,
                attributes: [
                    "id",
                    "fname",
                    "companyName",
                    "phoneNumber",
                    "email",
                ],
            },
        ],
        where: {
            came: came,
        },
        order: [["id", "DESC"]],
    })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
            res.json({ error: err });
        });
};

const recaptcha = async (req, res) => {
    const { token } = req.body;

    //sends secret key and response token to google
    await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${
            process.env.SECRET_KEY || process.env.SECRET_KEY2
        }&response=${token}`
    );

    //check response status and send back to the client-side
    if (res.status(200)) {
        res.send("Human 👨 👩");
    } else {
        res.send("Robot 🤖");
    }
};

const ContactSend = async (req, res) => {
    // let { id } = req.body;
    // let user = await Users.findOne({where:{id}});
    let { email, name, text, id } = req.body;

    let data = {
        email: "DemiryolExpressssss@gmail.com",
        subject: "Size Habar bar!",
        text:
            "Ulanyjy: " +
            name +
            " \n" +
            "Email: " +
            email +
            "\n" +
            "Habary:" +
            " " +
            text,
    };

    mailSend.SendMail(data);

    Contacts.create({
        subject: "Size Habar bar!",
        text: text,
        email: email,
        name: name,
        UserId: id,
        came: true,
        active: true,
        deleted: false,
    })
        .then((data) => {
            res.json("send");
        })
        .catch((err) => {
            console.log(err);
            res.json({ err: err });
        });
};

const SendResponse = async (req, res) => {
    const { messageId, text, subject } = req.body;
    let message = await Contacts.findOne({ where: { id: messageId } });
    if (message) {
        let data = {
            email: message.email,
            subject: subject,
            text: text,
        };
        mailSend.SendMail(data);
        Contacts.create({
            subject: subject,
            text: text,
            email: message.email,
            name: message.name,
            UserId: message.UserId,
            came: false,
            active: true,
            deleted: false,
        })
            .then((data) => {
                res.json("send");
            })
            .catch((err) => {
                console.log(err);
                res.json({ err: err });
            });
    } else {
        res.json("Bu Id boyuncha habar Yok!");
    }
};

const Delete = async (req, res) => {
    const { id } = req.params;
    const message = await Contacts.findOne({ where: { id } });
    if (message) {
        Contacts.destroy({ where: { id } })
            .then((data) => {
                res.json("Deleted!");
            })
            .catch((err) => {
                console.log(err);
                res.json({ err: err });
            });
    } else {
        res.json("Bu Id boyuncha Maglumat tapylmady!");
    }
};

exports.contacts_tb = contacts_tb;
exports.AllMessages = AllMessages;
exports.ContactSend = ContactSend;
exports.recaptcha = recaptcha;
exports.SendResponse = SendResponse;
exports.Delete = Delete;
