// import sequelize 
const { CHAR, INTEGER } = require("sequelize");
var Sequelize = require("sequelize");

//importing connection database
var sequelize = require("../../config/db");
const Users = require("./users");

var Contacts = sequelize.define(
    "Contact",
    {
        id:{
            type:Sequelize.INTEGER,
            primaryKey:true,
            autoIncrement:true,
        },
        subject:Sequelize.STRING,
        text:Sequelize.TEXT,
        email:Sequelize.TEXT,
        name:Sequelize.STRING,
        came:{type:Sequelize.BOOLEAN,default:true},
        active:{type:Sequelize.BOOLEAN,default:true},
        deleted:{type:Sequelize.BOOLEAN,default:false},
    },
    {
        timestamps: true,
    }
);



Contacts.belongsTo(Users);
Users.hasMany(Contacts);

module.exports = Contacts;