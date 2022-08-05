const path = require('path')
const express = require('express')
const hbs = require('hbs')

const app = express()
const port = process.env.PORT || 3000

var nodemailer = require('nodemailer');

//Define paths for express config
const publicDirPath = path.join(__dirname,'../public')
const viewPath = path.join(__dirname , '../templates/views')
const partialsPath = path.join(__dirname , '../templates/partials')


//Setpu handle bars and views locaton
app.set('view engine' , 'hbs')
app.set('views' , viewPath)
hbs.registerPartials(partialsPath)


//setup static directory to serve
app.use(express.static(publicDirPath))

var mysql = require('mysql');
const { getMaxListeners } = require('process')

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database:"bbs",
  multipleStatements: true
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected to db!");
});

let mailTransporter = nodemailer.createTransport({
    service: 'yahoo',
    auth: {
        user: 'blood_bank01@yahoo.com',
        pass: 'tdqjivgthjqpoica'
    }
});

let mailDetails = {
    from: 'blood_bank01@yahoo.com',
    to: 'f20201513@pilani.bits-pilani.ac.in',
    subject: 'Blood Bank',
    text: 'successfull',
};

// app.get('/about', (req,res) => {
//     res.render('about' , {
//         title: 'About Me',
//         name: 'Labeeb'
//     })
// })

app.get('', (req,res) => {
    res.render('index', {})
})

// app.get('/help', (req,res) => {
//     res.render('help' , {
//         helptext:'This is some help text',
//         title: 'Help Page',
//         name: 'Labeeb'
//     })
// })


app.get('/reg_status', (req,res) => {
    res.render('reg_status' , {position:req.query.name})
})

app.get('/err', (req,res) => {
    res.render('err' , {})
})

app.get('/addDonor', (req,res) => {

    var errcheck=0

    // console.log(req.query);
    // console.log(req.query.name);
    // console.log(req.query.aadhar);
    const name=req.query.name
    const aadhar=req.query.aadhar
    const email=req.query.email
    const weight=req.query.weight
    const height=req.query.height
    const bloodgroup=req.query.bloodgroup
    const city=req.query.city
    const age=req.query.age
    const gender=req.query.gender
    const phone=req.query.phone

    

    db.query(
        "set autocommit=0;"+//setting auto commit to 0
        "start transaction;"+//stating transaction
        "insert into bbs.donor values"+
        "(?, ?, ?, ?, ?, ?, ?, ?, current_timestamp(), ?, ?);"+//inserting donor info into donor table
        "select aadharNo, rName, email,contactNo "+
        "from bbs.recipient r1 "+
        "where "+
        "r1.bloodGroup = ? and ? = r1.city "+
        "and r1.addTime = (select min(addTime) "+
        "from bbs.recipient r where "+
        "r.bloodGroup = ? and ? = r.city ) limit 1;"//getting name,aadhar,email,phoneNo of recipient(if any) matching donor in city and bloodgroup
        ,
        [aadhar, name, city, bloodgroup, gender, age, phone, email, height, weight,bloodgroup,city,bloodgroup,city],
        (err,result)=>{
            if(err)
            {
                errcheck=1;
                console.log(err);
                res.send('Error')
            }
            else
            {
                
                console.log("Success with "+ aadhar)
                // console.log(result);

                match=result[3];
                
                // console.log(match)
                // console.log(match.length)
                // console.log(match[0].aadharNo)

                if(match.length>0)
                {
                    const r_aadhar=match[0].aadharNo
                    const r_email=match[0].email
                    const r_name=match[0].rName
                    const r_phone=match[0].contactNo

                    
                    mailDetails.to=email;
                    mailDetails.text='Your Match has been found, Recepient details are : \nName : '+r_name+'\nPhone No. : '+r_phone+'\nEmail : '+r_email;

                    mailTransporter.sendMail(mailDetails, function(err, data) {
                        if(err) {
                            errcheck=1
                            console.log('Error Occurs');
                            console.log(err);
                        } else {
                            console.log('Email sent successfully to donor');
                        }
                    });

                    mailDetails.to=r_email;
                    mailDetails.text='Your Match has been found, Donor details are : \nName : '+name+'\nPhone No. : '+phone+'\nEmail : '+email;

                    mailTransporter.sendMail(mailDetails, function(err, data) {
                        if(err) {
                            errcheck=1
                            console.log('Error Occurs');
                            console.log(err);
                        } else {
                            console.log('Email sent successfully to recepient');
                        }
                    });

                    db.query(
                        "DELETE FROM bbs.recipient r "+
                        "where r.aadharNo = ?;"+//deleting recipient from table after it has been matched
                        "DELETE FROM bbs.donor d "+
                        "where ? = d.aadharNo;"+//deleting donor from table after it has been matched
                        "commit;",//commiting
                        [r_aadhar,aadhar],(err,result)=>{
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                console.log("Success with deleting and commit "+aadhar+" "+r_aadhar)
                                // console.log(result);
                            }
                    })
                    if(errcheck==0)
                    res.send('Donor')
                    
                }
                else
                {
                    db.query(
                        "commit;",//commiting as no match found
                        [],(err,result)=>{
                            if(err)
                            {
                                console.log(err);
                                
                            }
                            else
                            {
                                console.log("Success with commit ")
                            }
                        })
                        if(errcheck==0)
                            res.send('Donor')
                }
            }
                
        }
    )
    
})
var r_id=0
app.get('/addRecepient', (req,res) => {

    var errcheck=0

    const name=req.query.name
    const aadhar=req.query.aadhar
    const email=req.query.email
    const age=req.query.age
    const phone=req.query.phone
    const bloodgroup=req.query.bloodgroup
    const city=req.query.city
    const gender=req.query.gender

    db.query(
        "set autocommit=0;"+//setting suto commit to 0
        "start transaction;"+//starting transaction
        "insert into recipient values"+
        "(?, ?, ?, ?, ?, ?, ?, ?, current_timestamp());"+//inserting recipient info into the recipient table
        "select aadharNo, dName, contactNo ,email "+
        "from bbs.donor d1 "+
        "where "+
        "d1.bloodGroup = ? and ? = d1.city "+
        "and d1.regTime = (select min(regTime) "+
        "from bbs.donor d where "+
        "d.bloodGroup = ? and ? = d.city ) limit 1;",//getting aadhar , email ,phone no and name of oldest donor with matching blood and city 
        [aadhar, name, city, bloodgroup, gender, age, phone, email,bloodgroup,city,bloodgroup,city],
        (err,result)=>{
            if(err)
            {
                errcheck=1
                console.log(err);
                res.send('Error')
            }
            else
            {
                console.log("Success with "+aadhar)

                match=result[3];
                

                if(match.length>0)
                {
                    const d_aadhar=match[0].aadharNo
                    const d_email=match[0].email
                    const d_name=match[0].dName
                    const d_phone=match[0].contactNo
                    
                    mailDetails.to=email;
                    mailDetails.text='Your Match has been found, Donor details are : \nName : '+d_name+'\nPhone No. : '+d_phone+'\nEmail : '+d_email;

                    mailTransporter.sendMail(mailDetails, function(err, data) {
                        if(err) {
                            errcheck=1
                            console.log('Error Occurs');
                            console.log(err);
                        } else {
                            console.log('Email sent successfully to Recepient');
                        }
                    });//sending email to recipient with donor info

                    mailDetails.to=d_email;
                    mailDetails.text='Your Match has been found, Recepient details are : \nName : '+name+'\nPhone No. : '+phone+'\nEmail : '+email;

                    mailTransporter.sendMail(mailDetails, function(err, data) {
                        if(err) {
                            errcheck=1
                            console.log('Error Occurs');
                            console.log(err);
                        } else {
                            console.log('Email sent successfully to Donor');
                        }
                    });//sending email to donor with recipient info
                    db.query(
                        "DELETE FROM bbs.recipient r "+
                        "where r.aadharNo = ?;"+//deleting recipient from table after it has been matched
                        "DELETE FROM bbs.donor d "+
                        "where ? = d.aadharNo;"+////deleting donor from table after it has been matched
                        "commit;",//commiting
                        [aadhar,d_aadhar],(err,result)=>{
                            if(err)
                            {
                                console.log(err);
                                
                            }
                            else
                            {
                                console.log("Success with deleting and commit "+aadhar+" "+d_aadhar)
                                // console.log(result);
                            }
                        })
                        if(errcheck==0)
                            res.send('Recipient')
                    
                }
                else
                {
                    mailDetails.to=email;
                    mailDetails.text='No match has been found yet.\nWe will get back to you as soon as we find a match.';

                    mailTransporter.sendMail(mailDetails, function(err, data) {
                        if(err) {
                            errcheck=1
                            console.log('Error Occurs');
                            console.log(err);
                        } else {
                            console.log('Email sent successfully to Recepient');
                        }
                    });

                    db.query(
                        "commit;",//commiting as no match found
                        [],(err,result)=>{
                            if(err)
                            {
                                console.log(err);
                                
                            }
                            else
                            {
                                console.log("Success with commit ")
                                // console.log(result);
                            }
                        })
                        if(errcheck==0)
                            res.send('Recipient')
                }
                

            }
        }
    )

    
    

})

app.get('/products',(req,res) => {
    if(!req.query.search) {
        return res.send({
            error: "You must provide a search term"
        })
    }
    console.log(req.query)
    res.send({
        products:[]
    })
})

app.get('/donors',(req,res) => {

    const j=[
        {
            n:123,
            m:1234,
            w:12345,
            v:123456   
        }
        ,{
            n:1239,
        m:12349,
        w:123459,
        v:1234569
        }
    ]
    db.query(
        "select * from blood_bank.donor",
        [],
        (err,rows,fields)=>{
            if(!err)
            {
                // console.log(rows);
                // console.log(fields);
                // console.log(fields[2].name)
                res.render('donors' , {
                    rows:rows
                })
            }
            else
                console.log("Probnbblem");
        }
    )

    // setTimeout(()=>{


    // console.log(row)
    // res.render('donors' , {
    //     rows:row
    // })
    // },1000)

})

app.get('*',(req,res) => {
    res.render('404',{
        // title: '404',
        // name: 'Labeeb',
        errorMsg:'Page Does Not Exist'
    })
})

app.listen(port, () => {
    console.log('Server is up on part '+port+" .")
})

setInterval(function() {

    db.query("SET AUTOCOMMIT=0;"+ 
    "DELETE FROM recipient "+ 
    "where TIMESTAMPDIFF(SQL_TSI_DAY,recipient.addTime,current_time()) >2 ;"+
    "COMMIT;",[],(err,rows,fields)=>{
        if(err)
        {
            console.log("ERROR IN AUTO DELETE");
        }
    })
    
    }, 1000);