const { error } = require('console');
const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Body parser middleware to handle JSON data
app.use(express.json());

// Replace the following with your MongoDB connection string
const mongoUrl = 'mongodb://mongo:27017/mydatabase';

// Connect to MongoDB using Mongoose
mongoose.connect(mongoUrl)
  .then(() => {
    console.log('Connected to Database');

    const documentSchema = new mongoose.Schema({
        Title: { type: String, required: true },
        Author: { type: String, required: true },
        CreationDate: { type: Date, default: Date.now()},
        Content: { type: String, required: true },
      });
      

      
    const Document = mongoose.model('documents', documentSchema);

 
    // Define validation rules using express-validator
    const validatePost = [
        body('Title').isString().notEmpty(),
        body('Author').isString().notEmpty(),
        body('Content').isString().notEmpty(),
    ];

    // POST endpoint to write data to MongoDB with validation
    app.post('/add_post', validatePost, async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If there are validation errors, provide informative error messages
            const errorMessages = errors.array().map(error => error.msg);
            return res.status(400).json({ errors: errorMessages });
        }

        const newDocument = new Document(req.body);
        try {
        const savedDocument = await newDocument.save();
        res.send({ message: 'Post added successfully', data: savedDocument });
        } catch (error) {
        res.status(400).send({ message: 'Error adding post', error: error.message });
        }
    });
  
    // GET endpoint to Get all posts sorted by creation date
    app.get('/data', (req, res) => {
      console.log("HERE!!!!")
    Document.find().sort({ CreationDate: 'asc' }) // Sort by 'CreationDate' in ascending order
    .then(posts => res.send(posts))
    .catch(error => res.status(500).send({ message: 'Error fetching posts', error: error.message }));
    });

    // GET endpoint to Get a post by id
    app.get('/post_by_id/:id', (req, res) => {
        const postId = req.params.id; // Get the post ID from the URL parameter
        Document.findById(postId) // Find a document by its _id
          .then(post => {
            if (post) {
              res.send(post);
            } else {
              res.status(404).send({ error: 'Post not found' });
            }
          })
          .catch(error => res.status(500).send({ message: 'Error fetching post', error: error.message }));
      });

          // DELETE endpoint to delete post by id from  MongoDB
    app.delete('/del_post/:id', (req, res) => {
        const postId = req.params.id; // Get the post ID from the URL parameter
        Document.findByIdAndDelete(postId) // Find a document by its _id
          .then(post => {
            if (post) {
              res.send(post);
            } else {
              res.status(404).send({ error: 'No post with the specified ID found' });
            }
          })
          .catch(error => res.status(500).send({ message: 'Error deleting post', error: error.message }));
      });

    // GET endpoint to Get all posts by user 
    app.get('/posts_by_user/:email', (req, res) => {
        const email = req.params.email; // Get the post ID from the URL parameter
        Document.find({Author : email}) // Find a document by its _id
          .then(posts => {
            if (posts.length === 0) {
                res.status(404).send({ error: 'User has not posted any content' });
              
            } else {
                res.send(posts);
            }
          })
          .catch(error => res.status(500).send({ message: 'Error fetching posts by user', error: error.message }));
      });

    //GET endpoint to get post by title 
    app.get('/post_by_title/:title',(req,res)=>{
        const title = req.params.title;
        Document.findOne({Title : title})
            .then(post => {
                if (post){
                    res.send(post)
                } else {
                    res.status(404).send({error:'No post with the specified Title found' })
                }
            })
            .catch(error => res.status(500).send({message: 'Error fetching posts by title', error : error.message}));
    });

 
    // Start the server
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch(console.error);
