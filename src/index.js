//importing frameworks and modules
const express = require("express")
const path = require("path")
const app = express()
const nodemailer = require("nodemailer")
// const hbs = require("hbs")

//importing DB
const { LogInCollection, StudCollection } = require("./mongo");
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//setup static files and views
const tempelatePath = path.join(__dirname, '../tempelates')
const publicPath = path.join(__dirname, '../public')
console.log(publicPath);

//setup template engine (HBS)
app.set('view engine', 'hbs')
app.set('views', tempelatePath)
app.use(express.static(publicPath))


//mail config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '', // Your Gmail address
        pass: '' // Your App Password
    }
});

// hbs.registerPartials(partialPath)

//Pages routing
app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/', (req, res) => {
    res.render('login')
})
app.get('/fp',(req,res)=>{
    res.render('otp')
})



// app.get('/home', (req, res) => {
//     res.render('home')
// })



//signup Route
app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
    };

    try {
        const checking = await LogInCollection.findOne({ username: req.body.username });
        
        // Check if user already exists
        if (checking) {
            return res.status(400).send("User details already exist");
        } else {
            // If not exists, save the new user
            await LogInCollection.insertMany([data]);
            return res.status(201).render("success", {  
                naming: req.body.name
            });
        }
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("Server error");
    }
});

const otpStore={};
//otp Functionality
app.post('/otp',async(req,res)=>{
    const email=req.body.email;
    const check = await LogInCollection.findOne({ username: req.body.username })
    const otp=Math.floor(1000 + Math.random() * 9000).toString();

    const mailOptions = {
        from: '', //your email address
        to: email,
        subject: 'OTP Authentication',
        text: `Your OTP code is: ${otp}`
    };
    transporter.sendMail(mailOptions, (error, info, msg) => {
        if (error) {
            return res.status(500).send('Error sending email: ' + error.toString());
        }
        console.log('Email sent: ' + info.response);
        otpStore[email] = otp;
        return res.status(200).render("otp",{msg:"email sent to "+email,email:email});
    });
})


//Verify OTP
app.post('/verifyotp', (req, res) => {
    const email = req.body.email; 
    const enteredOtp = req.body.otp;
    
    if (otpStore[email] && enteredOtp === otpStore[email]) {
        // OTP verified successfully
        delete otpStore[email]; // Remove OTP after verification
        return res.status(200).render("home",{name:email});
    } else {
        // OTP verification failed
        return res.status(401).render("otp",{msg1:"Invalid OTP. Please try again.",email:email});
    }
});



//login route
app.post('/login', async (req, res) => {

    try {
        const check = await LogInCollection.findOne({ username: req.body.username })
        console.log(check)
        if (check.password === req.body.password) {
            const students = await StudCollection.find();
            res.status(201).render("home", { naming: `${check.name}`,students:students})
        }

        else {
            res.render("error",{errorname:"incorrect password"})
        }


    } 
    
    catch (e) {
        
        res.render("error",{errorname:"wrong details"})
        

    }


})

//login pages and verification code ends here:))


//Student Management System


// ADD Student
app.post('/addstud', async (req, res) => {
    const data = {
        Name: req.body.name,
        age: req.body.age,
        dept: req.body.dept,
        section: req.body.section
    };
    
    try {
        await StudCollection.create(data); // Add new student
        console.log("Data added:", data);
        
        const students = await StudCollection.find();
        res.render('home', { students: students });
    } catch (err) {
        console.error("Error adding student:", err);
        res.status(500).send("Error adding student");
    }
});



// GET All Students
app.get('/login', async (req, res) => {
    try {
        const check = await LogInCollection.findOne({ username: req.body.username })
        
        const students = await StudCollection.find();
        console.log("Retrieved students:", students);
        res.render('home', {students: students }); 
    } catch (err) {
        console.error("Error retrieving students:", err);
        res.status(500).send("Error retrieving students");
    }
});


//delete student
app.post('/deletestud/:id', async (req, res) => {
    try {
        await StudCollection.findByIdAndDelete(req.params.id);
        console.log(`Student with ID ${req.params.id} deleted`);
        res.redirect('/login');
    } catch (err) {
        console.error("Error deleting student:", err);
        res.status(500).send("Error deleting student");
    }
});


// EDIT Student by ID
app.post('/editstud/:id', async (req, res) => {
    const { id } = req.params;
    const { name, age, dept, section } = req.body;

    try {
        await StudCollection.findByIdAndUpdate(id, { Name: name, age, dept, section });
        console.log(`Student with ID ${id} updated`);
        res.redirect('/login');
    } catch (err) {
        console.error("Error editing student:", err);
        res.status(500).send("Error editing student");
    }
});

//search Student
app.get('/search', async (req, res) => {
    const searchQuery = req.query.search;

    try {
        const students = await StudCollection.find({ Name: { $regex: searchQuery, $options: 'i' } });
        res.render('home', { students: students });
    } catch (err) {
        console.error("Error searching students:", err);
        res.status(500).send("Error searching students");
    }
});

//Logout
app.get('/logout', (req, res) => {
        res.redirect('/'); // After logout, redirect to the login page
    });

//server port assigning and running
app.listen(3000,()=>{
    console.log("The server running on port 3000")
})
