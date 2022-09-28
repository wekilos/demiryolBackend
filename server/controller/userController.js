var Sequelize = require("sequelize");
var fetch = require('node-fetch');
var Users = require("../models/users");
var sequelize = require("../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Func = require("../functions/functions");
const Op = Sequelize.Op;

 const users_tb = async (req, res) => {
  console.log("requested")
    const response = await sequelize
      .sync()
      .then(function () {
        const data = Users.findAll();
        console.log("connection connected");
        return data;
      })
      .catch((err) => {
        return err;
        console.log("connection connected");
      });
    res.json(response);
  };


  const create = async (req, res) => {
  
    const {fname,
      phoneNumber,
      email,
      password,
      companyName} = req.body; 
    const existUser = await Users.findOne({
      where:{
        email:email,
      }
    });

    const salt = bcrypt.genSaltSync();
    bcrypt.hash(password, salt, (err, hashpassword) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ msg: "Error", err: err });
      } else {
        
    if(existUser){
      let text = "Bu emailde ulanyjy onden bar.";
      res.json({
        msg:text
      })
    }else{
      Users.create({
        fname,
        phoneNumber,
        email,
        password:hashpassword,
        companyName,
        active:true,
        deleted:false,
      }).then(async(data) => {
        
        jwt.sign(
          {
            id: data.id,
            name: data.fname,
            phoneNumber:data.phoneNumber,
            email:data.email
          },
          Func.Secret(),
          (err, token) => {
            res.status(200).json({
              msg: "Suссessfully",
              token: token,
              id:data.id,
              name: data.fname,
              phoneNumber:data.phoneNumber,
              email:data.email
            });
          }
        );
      }).catch((err) => {
        console.log(err);
        res.json("create user",err)
      });
    }


      }
    });

  };

  const login = async(req,res)=>{
  
  const { email, password } = req.body;

  
  
   await Users.findOne({
   
    where: { email: email },
  }).then(async(data)=>{
   
    if(!data.active){
      res.json("Siz DisActive edilen!")
      return 0;
    }

   if (await bcrypt.compare(password, data.password)) {
        const token = jwt.sign(
          {
            id: data.id, 
            name: data.fname,
            phoneNumber:data.phoneNumber,
            email:data.email
          },
          Func.Secret()
        );
        
        return res.json({
          id: data.id,
          token: token,
          id:data.id,
          name: data.fname, 
          phoneNumber:data.phoneNumber,
          email:data.email,  
          login: true,
        });
      } else {
        let text = "Siziň ulanyjy adyňyz ýa-da açar sözüňiz nädogry!";
        res.send({
          msg: text,
          login: false,
        });
      }
    
  }).catch((err)=> {
   let text = "Hasaba alynmadyk ulanyjy!";
    res.send({ login: false, msg: text,err:err });
  }) 

  }

  const update = async (req, res) => {
  
    const {fname,
      phoneNumber,
      id,
      password,
      companyName,} = req.body;

     
   
      const salt = bcrypt.genSaltSync();
      bcrypt.hash(password, salt, (err, hashpassword) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ msg: "Error", err: err });
        } else {

          Users.update({
            fname, 
            phoneNumber,
            password:hashpassword,
            companyName,
        active:true,
        deleted:false,
      },{
        where:{
          id:id
        }
      }).then(async(data) => {
        
      res.json("updated")
        
      }).catch((err) => {
        console.log(err);
        res.json("create user",err)
      });

    }
  });

    }


    const disActive = async(req,res)=>{
      const { id } = req.params;
      let user = await Users.findOne({where:{id}});
      if(user){
          Users.update({
            active:false
          },{
            where:{
              id
            }
          }).then(()=>{
            res.json("DisActived!")
          }).catch((err)=>{
            console.log(err);
            res.json({err:err});
          })
      }else{
        res.json("Bu Id Boyuncha User yok!")
      }
    }

    const Active = async(req,res)=>{
      const { id } = req.params;
      let user = await Users.findOne({where:{id}});
      if(user){
          Users.update({
            active:true
          },{
            where:{
              id
            }
          }).then(()=>{
            res.json("Actived!")
          }).catch((err)=>{
            console.log(err);
            res.json({err:err});
          })
      }else{
        res.json("Bu Id Boyuncha User yok!")
      }
    }




  


  exports.users_tb=users_tb;
  exports.create = create;
  exports.login = login;
  exports.update = update;
  exports.disActive = disActive;
  exports.Active = Active;