const express = require('express');
require("./db/config");
const DataItem = require('./db/data_item');
const app = express();
const bcrypt=require('bcryptjs');
const nodemailer = require('nodemailer');
const { v4 : uuidv4 } = require('uuid');

const cors = require('cors');
const adminData = require('./db/admin_data');
const port = 5000;
app.use(express.json());
app.use(cors({
  origin: '*', // Wildcard is NOT for Production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}
));

//This is API use for Sign Up 
app.post('/signup', async (req, resp) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    let admin = await adminData.findOne({ email });
  if (admin) {
    return resp.status(400).json(true);
  }
  
     admin = new adminData({ name, email, password: hashedPassword });
  
    try {
        let result=await admin.save();
      resp.status(201).send(result);
    } catch (error) {
      resp.status(400).send({ message: 'Error registering admin'});
    }
});

//This API is use for login 
app.post('/login', async (req, resp) => {
    
  
const { email, password } = req.body;

  try {
    const user = await adminData.findOne({ email });

    if (!user) {
      return resp.status(404).send({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return resp.status(401).send({ message: 'Invalid password' });
    }

    resp.status(200).send(user);
  } catch (error) {
    resp.status(500).send({ message: 'Error logging in', error });
  }
})
//This is API using for forgot password through node mailer
/*app.post('/forgot-password', async (req, resp) => {
    const { email } = req.body;
    const user = await adminData.findOne({ email });
  
    if (!user) {
      return resp.status(404).json({ message: 'User not found' });
    }
  
    // Generate a reset token (using uuid instead of crypto)
    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 300; // 1 hour
    await user.save();
  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });
  
    const mailOptions = {
      to: user.email,
      from: 'your-email@gmail.com',
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             http://localhost:3000/reset/${resetToken}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return resp.status(500).json({ message: 'Error sending email' });
      }
      resp.status(200).json({ message: 'Reset link sent' });
    });
  });*/






//This API use for add item into mongodb database
app.post("/add-item", async (req, resp) => {
    let item = new DataItem(req.body);
    let result = await item.save();
    console.log(result);
    resp.send(result);
});

//This API use for fetch data from mongodb database on home page
app.get('/get-home', async (req, resp) => {

    const item = await DataItem.find({ btn: { $eq: "home" } }).sort({ date: 1 });

    if (item.length > 0) {
        resp.json(item);
    } else {
        resp.json({ result: "No Item found" });
    }
});


//This API use for fetch data from mongodb database on debit page
app.get('/get-debit', async (req, resp) => {

    const item = await DataItem.find({ btn: { $eq: "debit" } }).sort({ date: 1 });

    if (item.length > 0) {

        resp.send(item);
    } else {
        resp.send({ result: "No Item found" });
    }
});
//This API use for fetch data from mongodb database on credit page
app.get('/get-credit', async (req, resp) => {

    const item = await DataItem.find({ btn: { $eq: "credit" } }).sort({ date: 1 });

    if (item.length > 0) {

        resp.send(item);
    } else {
        resp.send({ result: "No Item found" });
    }
});

//This API use for delete data from mongodb database
app.delete('/item/:id', async (req, resp) => {
    let result = await DataItem.deleteOne({ _id: req.params.id });
    resp.send(result);
});

//This API use for fetch data from database and store into update components
app.get('/getone/:id', async (req, resp) => {
    const result = await DataItem.find({ _id: req.params.id });

    if (result.length > 0) {

        resp.send(result);
    } else {
        resp.send({ result: "No Item found" });
    }
});
//This is API is use for update the data in mongodb database
app.put('/update-item/:id', async (req, resp) => {
    let result = await DataItem.updateOne({ _id: req.params.id }, { $set: req.body });
    resp.send(result);
});
//This is API is use for searching the data based on requirment

app.get('/search-item', async (req, resp) => {
    const { desc, date, amount } = req.query;

    const query = {};

    if (desc) {
        query.desc = { $regex: desc, $options: 'i' }; // Case-insensitive regex search
    }

    // if (btn) {
    //   query.btn = { $regex: btn, $options: 'i' }; // Case-insensitive regex search
    //}

    if (amount) {
        query.amount = {};
        if (amount) query.amount.$eq = Number(amount);
        //if (maxQuantity) query.amount.$lte = Number(maxQuantity);
    }

    if (date) {
        query.date = {};
        if (date) query.date.$eq = new Date(date);
        //if (endDate) query.date.$lte = new Date(endDate);
    }

    const items = await DataItem.find(query);
    resp.send(items);
});

app.get("/search/:key", async (req, resp) => {
  let result = await DataItem.find({ desc: {$regex: req.params.key}},
          
      
  );
  resp.send(result);
})






app.listen(port,'0.0.0.0' ,() => { console.log(`Server running on http://0.0.0.0:${port}`) });