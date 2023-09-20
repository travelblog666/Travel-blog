const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const session = require('express-session'); 
const { Schema } = mongoose;

const app = express();
app.set('view engine', 'ejs'); // Use 'pug' or 'handlebars' for other engines
app.set('views', path.join(__dirname, 'views')); // Change 'views' to your directory name
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.urlencoded({
    extended: true
}));

// Set up sessions
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

//replace the link inside the single quote  ('mongo......') with ur url of database
mongoose.connect('mongodb+srv://pythor666:Pass1234@cluster0.z2tsgxn.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error', () => console.log("error in connecting the database"));
db.once('open', () => console.log("connected successfully"));

// Define User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phno: String,
    password: String,
    isAdmin: {
        type: Boolean,
        default: false // Set this to true for admin users
    },
});

const User = mongoose.model('User', userSchema);

// Define BlogPost schema
const blogPostSchema = new Schema({
    image: String,
    title: String,
    description: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// Your routes...

// Login route
app.post("/login", async (request, response) => {
    try {
        const username = request.body.username;
        const password = request.body.password;

        const user = await User.findOne({ email: username });

        if (user === null) {
            response.send("Invalid information! Please create an account first.");
        } else {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                // Store user information in the session
                request.session.user = user;
                return response.redirect('/html/blog.html');
            } else {
                response.send("Invalid Password!");
            }
        }
    } catch (error) {
        response.send("Invalid information");
    }
});

// Sign up route
app.post("/signup", async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const phno = req.body.phno;
        const password = req.body.password;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name: name,
            email: email,
            phno: phno,
            password: hashedPassword
        });

        await user.save();

        // Store user information in the session
        req.session.user = user;

        return res.redirect('/html/blog.html');
    } catch (error) {
        console.error(error);
        res.send("Error creating user");
    }
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create a new blog post
app.post('/create', upload.single('image'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const image = req.file.filename;

        // Get the user from the session
        const user = req.session.user;

        const newBlogPost = new BlogPost({
            title,
            description,
            image,
            author: user._id
        });

        await newBlogPost.save();
        res.redirect('/html/blog.html');
    } catch (error) {
        console.error(error);
        res.redirect('/?error=1');
    }
});
const nodemailer = require('nodemailer');


// Handle form submission to send emails to subscribers
app.post('/send-email', async (req, res) => {
    try {
        const { subject, message } = req.body;
        // Create a transporter object using nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail as the email service provider
    auth: {
        user: 'travelblogvarcon@gmail.com', // Your Gmail email address
        pass: 'wbfannbotkivsrjz', // Your Gmail password or an App Password if you have 2-factor authentication enabled
    },
});


        
        // Fetch subscribers' email addresses from the database
        const subscribers = await Subscriber.find({}, 'email');
        const recipientEmails = subscribers.map((subscriber) => subscriber.email);

        // Send emails to subscribers
        await transporter.sendMail({
            from: 'your_email@example.com',
            to: recipientEmails.join(', '), // List of subscriber emails
            subject: subject,
            text: message,
        });

        res.send('Emails sent successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while sending emails');
    }
});


// Fetch user's blog posts
app.get('/get-blogs', async (req, res) => {
    try {
        // Get the user from the session
        const user = req.session.user;

        const userBlogs = await BlogPost.find({ author: user._id });

        res.json(userBlogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching user posts.' });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
});

// Serve the login and signup page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/home.html');
});

// Serve the blog management page
app.get('/html/blog.html', (req, res) => {
    res.sendFile(__dirname + '/public/html/blog.html');
});

// Serve the add blog page
app.get('/html/add-blog.html', (req, res) => {
    res.sendFile(__dirname + '/public/html/add-blog.html');
});


//edit posts --------------------------------------------------
app.post('/edit-blog/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const { title, description } = req.body;

        // Use Mongoose to find and update the blog post by ID
        const updatedBlogPost = await BlogPost.findByIdAndUpdate(
            postId,
            { title, description },
            { new: true } // This option returns the updated document
        );

        if (!updatedBlogPost) {
            return res.status(404).json({ success: false, error: 'Blog post not found' });
        }

        // Respond with a success message
        res.redirect('/html/blog.html');
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});






























app.get('/delete-blog/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;

        // Use Mongoose to find and delete the blog post by ID
        const deletedBlogPost = await BlogPost.findByIdAndRemove(postId);

        if (!deletedBlogPost) {
            return res.status(404).send('Blog post not found');
        }

        // Redirect to the blog listing page or wherever you want
        res.redirect('/html/blog.html');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});





app.get('/admin.html', (req, res) => {
    res.sendFile(__dirname + '/public/html/admin.html');
});


app.get('/admin/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
});
// DELETE route for deleting a user by ID
app.delete('/admin/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        // Use the `User` model to find and remove the user by ID
        const deletedUser = await User.findByIdAndRemove(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Admin Login Route
app.post("/admin-login", async (request, response) => {
    try {
        const username = request.body.username;
        const password = request.body.password;

        // Retrieve the admin user from the database by checking the "isAdmin" field
        const adminUser = await User.findOne({ email: username, isAdmin: true });

        if (!adminUser) {
            response.send("Invalid information!❌❌❌");
        } else {
            if (adminUser.password === password) {
                // Authentication successful, render the admin.html page
                return response.sendFile(__dirname + '/public/html/admin.html');
            } else {
                response.send("Invalid Password!❌❌❌");
            }
        }
    } catch (error) {
        response.send("Invalid information❌");
    }
});



















app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});

// Route to render the explore page
app.get('/explore', async (req, res) => {
    try {
        // Fetch all blog posts from the database
        const blogPosts = await BlogPost.find();

        // Send the blog posts as JSON
        res.json(blogPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching blog posts.' });
    }
});

// Update your server code

// Add this route to render the 'a.ejs' template
app.get('/a', async (req, res) => {
    try {
        // Fetch all blog posts from the database
        const blogPosts = await BlogPost.find();

        // Render the 'a.ejs' template with the blog data
        res.render('a', { blogPosts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching blog posts.' });
    }
});


// Add this route to fetch and display all blog posts
app.get('/all-blogs', async (req, res) => {
    try {
        // Fetch all blog posts from the database
        const blogPosts = await BlogPost.find();

        // Render a new page to display the blog posts in card view
        res.render('all-blogs', { blogPosts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching blog posts.' });
    }
});

// Add a new route for fetching and managing blog posts in admin
app.get('/admin-blog-list', async (req, res) => {
    try {
        // Fetch all blog posts from the database
        const blogPosts = await BlogPost.find();

        // Render the admin-blog-list.ejs template with the blog data
        res.render('admin-blog-list', { blogPosts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching blog posts.' });
    }
});

// Add a route to handle blog post deletion
app.post('/admin-delete-blog/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;

        // Use Mongoose to find and delete the blog post by ID
        const deletedBlogPost = await BlogPost.findByIdAndRemove(postId);

        if (!deletedBlogPost) {
            return res.status(404).send('Blog post not found');
        }

        // Redirect back to the admin-blog-list page or wherever you want
        res.redirect('/admin-blog-list');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
// Define Subscriber schema
const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Ensure email addresses are unique
        lowercase: true, // Convert email addresses to lowercase
        trim: true // Remove leading/trailing whitespaces
    }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
// Subscribe to Email Updates route
app.post("/subscribe", async (req, res) => {
    try {
        const email = req.body.email;

        // Create a new subscriber
        const newSubscriber = new Subscriber({ email });

        // Save the subscriber to the database
        await newSubscriber.save();

        res.send("You have successfully subscribed to email updates!");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while processing your request.");
    }
});
// Route to fetch subscribed emails
app.get('/fetch-subscribed-emails', async (req, res) => {
    try {
        // Fetch subscribed emails from your MongoDB (replace with your actual code)
        const subscribers = await Subscriber.find({}, 'email');
        const emails = subscribers.map((subscriber) => subscriber.email);

        // Send the list of subscribed emails as JSON
        res.json({ emails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching subscribed emails.' });
    }
});
// Add a route to handle removing a subscribed email
app.post('/remove-subscribed-email', async (req, res) => {
    try {
        const { email } = req.body;

        // Remove the email from the database (assuming you have a Subscriber model)
        const removedEmail = await Subscriber.findOneAndRemove({ email });

        if (removedEmail) {
            // Email removed successfully
            res.status(200).send('Email removed successfully');
        } else {
            // Email not found
            res.status(404).send('Email not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while removing the email');
    }
});
app.get('/delete/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;

        // Use Mongoose to find and delete the blog post by ID
        const deletedBlogPost = await BlogPost.findByIdAndRemove(postId);

        if (!deletedBlogPost) {
            return res.status(404).send('Blog post not found');
        }

        // Redirect to the blog listing page or wherever you want
        res.redirect('/a');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

