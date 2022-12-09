var Sequelize = require("sequelize"); 
var sequelize = require("../../config/db");
const mailSend = require("../functions/mailSend");
const OrderDocs = require("../models/orderDocs");
const Orders = require("../models/orders");
const fs = require('fs');
const Users = require("../models/users");
const Op = Sequelize.Op;

const orders_tb = async (req, res) => {
    const response = await sequelize
      .sync()
      .then(function () {
        const data = Orders.findAll();
        console.log("connection connected");
        return data;
      })
      .catch((err) => {
        return err; 
      });
    res.json(response);
  };

  const getAllOrders = async(req,res)=>{
    const {status,active} = req.query
    let Active = active? active : true;
    Orders.findAll({
        include:[
            {
                model:OrderDocs,
                attributes:["id","title","fileName","active","OrderId"]
            },
            {
                model:Users,
                attributes:["id",'fname','companyName','phoneNumber','email']
            }
        ],
        
            where:{
                [Op.and]:[{active:Active},{status:status}]
            },
        
        order: [
            ['id', 'DESC'],
        ]
    }).then((data)=>{
        res.send(data);
    }).catch((err)=>{
        console.log(err);
        res.json(err);
    })
  }
 
  const getAllDisActiveOrders = async(req,res)=>{
    const {active} = req.query
    // let Active = active? active : true;
    Orders.findAll({
        include:[
            {
                model:OrderDocs,
                attributes:["id","title","fileName","active","OrderId"]
            },
            {
                model:Users,
                attributes:["id",'fname','companyName','phoneNumber','email']
            }
        ],
        
            where:{
                [Op.and]:[{active:false}]
            },
        
        order: [
            ['id', 'DESC'],
        ]
    }).then((data)=>{
        res.send(data);
    }).catch((err)=>{
        console.log(err);
        res.json(err);
    })
  }
 
  

  const getAllOrdersOneUser = async(req,res)=>{
    const {UserId} = req.params;
    Orders.findAll({
        include:[
            {
                model:OrderDocs,
                attributes:["id","title","fileName","active","OrderId"]
            }
        ],
        
            where:{
                UserId:UserId
            },
        
        order: [
            ['id', 'DESC'],
        ]
    }).then((data)=>{
        res.send(data);
    }).catch((err)=>{
        console.log(err);
        res.json(err);
    })
  }


  const createOrder = async(req,res)=>{
    const { fname, lname, message,userId } = req.body;
    console.log("filessss===>>>>>>",req.files.files)
    const  files  = req.files.files.constructor===Array ? req.files.files : [req.files.files];
    console.log("filessss>>>>>>",typeof(files))
    console.log("files",files);
    if(files.length>0){
        Orders.create({
            fname,
            lname,
            message,
            status:1,
            status_tm:"Garaşylýar",
            status_ru:"Garaşylýar",
            status_en:"Garaşylýar",
            payBefore:0,
            payment:0,
            UserId:userId,
            active:true,
            deleted:false
        }).then((data)=>{
            files?.map((file,i)=>{
                console.log("file",file)
                let randomNumber = Math.floor(Math.random() * 999999999999);
                let fileDirection = `./uploads/`+randomNumber+`${file.name}`;
                fs.writeFile(fileDirection, file.data, function(err) { console.log(err) });
                OrderDocs.create({
                    title:file.name,
                    fileName:fileDirection,
                    OrderId:data.id,
                    active:true,
                    deleted:false,
                }).then(()=>{
                    i+1 == files.length && res.json("Succesfully!")
                }).catch((err)=>{
                    console.log(err);
                })
            })
        }).catch((err)=>{
            console.log(err);
        })
        
        
    }else{
        res.json("file yuklenmedi!")
    }

}


const makeOrder = async(req,res)=>{
    const { id, code, payBefore, payBeforeType } = req.body;
    const  filess  = req.files.filess.constructor===Array ? req.files.filess : [req.files.filess];
    console.log(filess);
    const order = await Orders.findOne({where:{id}});
    if(!filess){
        res.json("File Yok!");
    }
    if(!order){
        res.json("Bu ID boyuncha Order Tapylmady!");
    }else{
        Orders.update({
            code,
            payBefore,
            payBeforeType,
            status_en:"Kabul edildi",
            status_ru:"Kabul edildi",
            status_tm:"Kabul edildi",
            status:2
        },
        {
            where:{id:id}
        }).then((data)=>{
            if(filess.length==0){
                res.json("updated!");
            }else{
                filess?.map((file,i)=>{
                    let randomNumber = Math.floor(Math.random() * 999999999999);
                    let fileDirection = `./uploads/`+randomNumber+`${file.name}`;
                    fs.writeFile(fileDirection, file.data, function(err) { console.log(err) });
                    OrderDocs.create({
                        title:file.name,
                        fileName:fileDirection,
                        OrderId:id,
                        active:true,
                        deleted:false,
                    }).then(()=>{

                        i+1 == filess.length && res.json("Succesfully!")
                    }).catch((err)=>{
                        console.log(err);
                        res.json({err:err})
                    })
                })
            }
        }).catch((err)=>{
            console.log(err);
        })
    }
}

const makePayment = async(req,res)=>{
    const { id, payment, peymentType} = req.body;
    const  filess  = req.files?.files.constructor===Array ? req.files?.files : [req.files?.files];
    
    console.log(filess);
    const order = await Orders.findOne({where:{id}});
    if(!filess){
        res.json("File Yok!");
    }
    if(!order){
        res.json("Bu ID boyuncha Order Tapylmady!");
    }else{
        Orders.update({
            payment,
            peymentType,
            status_en:"Hasaplanyldy!",
            status_ru:"Hasaplanyldy!",
            status_tm:"Hasaplanyldy!",
            status:3
        },
        {
            where:{id:id}
        }).then((data)=>{
            if(filess.length==0){
                res.json("updated!");
            }else{
                filess?.map((file,i)=>{
                    let randomNumber = Math.floor(Math.random() * 999999999999);
                    let fileDirection = `./uploads/`+randomNumber+`${file.name}`;
                    fs.writeFile(fileDirection, file.data, function(err) { console.log(err) });
                    OrderDocs.create({
                        title:file.name,
                        fileName:fileDirection,
                        OrderId:id,
                        active:true,
                        deleted:false,
                    }).then(()=>{

                        i+1 == filess.length && res.json("Succesfully!")
                    }).catch((err)=>{
                        console.log(err);
                        res.json({err:err})
                    })
                })
            }
        }).catch((err)=>{
            console.log(err);
        })
    }
}


const CancelOrder = async(req,res)=>{
    const { id } = req.params;
    const order = await Orders.findOne({where:{id}});
    if(!order){
        res.send("BU ID boyuncha order yok!");
    }else{
        Orders.update({
            active:false
        },{
            where:{id:id}
        }).then((data)=>{
            res.json("Canceled!")
        }).catch((err)=>{
            console.log(err);
            res.json({err:err});
        })
    }
}
const DisCancelOrder = async(req,res)=>{
    const { id } = req.params;
    const order = await Orders.findOne({where:{id}});
    if(!order){
        res.send("BU ID boyuncha order yok!");
    }else{
        Orders.update({
            active:true
        },{
            where:{id:id}
        }).then((data)=>{
            res.json("DisCanceled!")
        }).catch((err)=>{
            console.log(err);
            res.json({err:err});
        })
    }
}

  exports.orders_tb = orders_tb;
  exports.getAllOrders = getAllOrders;
  exports.getAllDisActiveOrders = getAllDisActiveOrders;
  exports.getAllOrdersOneUser = getAllOrdersOneUser;
  exports.createOrder = createOrder;
  exports.makeOrder = makeOrder;
  exports.makePayment = makePayment;
  exports.CancelOrder = CancelOrder;
  exports.DisCancelOrder = DisCancelOrder;