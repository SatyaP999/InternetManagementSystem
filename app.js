var express = require("express");
var bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const { type } = require("os");
mongoose.connect("mongodb+srv://aashrithbruno:demo1234@cluster0.qznxxd6.mongodb.net/userData?retryWrites=true&w=majority");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function(callback){
    console.log("connection succeeded");
})

var app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

app.post('/sign_up', function(req, res){
    var email = req.body.email;
    var name = req.body.name;
    var role = req.body.role;
    var phone = req.body.phone;
    var pass = req.body.password;

    bcrypt.hash(pass, 10, function(err, hash) {
        if (err) {
            console.error('Error hashing password:', err);
            throw err;
        }

        var data = {
            "email": email,
            "name": name,
            "role": role,
            "phone": phone,
            "password": hash // Store the hashed password
        }

        db.collection('User_Admin_Details').insertOne(data, function(err, collection) {
            if (err) throw err;
            console.log("Record inserted successfully");
        });
        return res.sendFile(path.join(__dirname, 'login.html'));
    });
});

app.post('/login', function(req, res){
    var email = req.body.email;
    var pass = req.body.password;
    var role = req.body.role;

    console.log('Received email:', email);
    console.log('Received password:', pass);

    var loginData = {
        "email": email,
    }

    db.collection('User_Admin_Details').findOne(loginData, function(err, user){
        if (err) {
            console.error('Error:', err);
            throw err;
        }

        if (user) {
            console.log('User found:', user);

            // User found, now compare passwords
            bcrypt.compare(pass, user.password, function(err, result) {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    throw err;
                }
                if (result) {
                    // Passwords match, login successful
                    console.log("Login Successful");
                    const userRole = user.role.toLowerCase();
                    if(userRole == "user"){
                        return res.sendFile(path.join(__dirname, 'complaintHistory.html'));
                    }else{
                        return res.sendFile(path.join(__dirname, 'complaintHistoryForCSGEmployee.html'));
                    }
                } else {
                    // Passwords do not match, login failed
                    console.log("Invalid Password");
                    return res.sendFile(path.join(__dirname, 'login.html'));
                }
            });
        } else {
            // User not found, login failed
            console.log("User not found");
            return res.sendFile(path.join(__dirname, 'login.html'));
        }
   });
});

app.post('/complaint_form', function(req, res){
    var rollNo = req.body.rollNo;
    var name = req.body.name;
    var phNo = req.body.phNo;
    var location = req.body.location;
    var complaint = req.body.complaint;

    var data = {
        "rollNo": rollNo,
        "name": name,
        "phNo": phNo,
        "location": location,
        "complaint": complaint
    }
    db.collection('Complaint_Details').insertOne(data, function(err, collection) {
        if (err) throw err;
        console.log("Record inserted successfully");
    });
    return res.sendFile(path.join(__dirname, 'complaintHistory.html'));

});




// Route for handling the home page
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(3000, () => {
    console.log("Server listening at port 3000");
});
