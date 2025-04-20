import express from 'express';
import cloudinary from '../lib/cloudinary.js'
import Book from '../models/Book.js';
import protectRoute from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a Book
router.post('/add-book', protectRoute ,async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

        if(!image || !title || !caption || !rating){
            return res.status(400).json({message: 'Please Provide All Details'});
        }

        // Upload the image to cloudinary 
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageURL = uploadResponse.secure_url;
        // save Image into the database
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageURL,
            user: req.user._id,
        });

        await newBook.save();

    } catch (error) {
        console.log('Error Creating Book', error);
        res.status(500).json({message: error.message});
    }
});

// Get all books and implementing infinite scrolling
router.get('/get-books', protectRoute, async (req, res) => {
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = (await Book.find())
        .sort({ createdAt: - 1}) // Descending order book fetch picking the latest books
        .skip(skip)
        .limit(limit)
        .populate('user', 'username profileImage');

        const totalBooks = await Book.countDocuments();
        
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });

    } catch (error) {
        console.log('Error in Getting all books', error);
        res.status(500).json({message: "Internla Server Error"});
    }
})

// Get Recommended books by  the logged in user
router.get('/user', protectRoute, async (req, res) => {
    try {
        const books = (await Book.find({ user: req.user._id })).sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.log("Get user book error", error);
        res.status(500).json({ message: "Server Error" });
    }
})

// Delete Boook
router.delete('/:id', protectRoute, async (req, res) => {
   try {
    const book = await Book.findById(req.params.id);

    if(!book){
        return res.status(404).json({ message: "Book Not Found" });
    }

    // Check if user is the creator of the book
    if(book.user.toString() !== req.user._id.toString()){
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Delete the Image from Cloudinary
    if(book.image && book.image.includes('cloudinary')){
        try {
            const publicId = book.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.log('Error Deleting Image from Cloudinary', error);
        }
    }

    await book.deleteOne();

    res.json({ message: "Book Deleted Successfully" });

   } catch (error) {
    console.log('Error Deleting Book', error);
    res.status(500).json({ message: "Internal Server Error" });
   } 
});

export default router;