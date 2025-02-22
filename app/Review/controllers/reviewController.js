const Review = require('../models/reviewModel');

// Add a review to a product
exports.addReview = async (req, res) => {
    //console.log('Request Body:', req.body);
    const { productId, rating, description } = req.body;
    const userId = req.user._id; // Assuming you have user authentication in place
    //console.log('Received Data:', { productId, rating, description, userId });
    try {

        if (!productId || !description) {
            return res.status(400).json({ success: false, message: 'Product ID and description are required' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        const review = await Review.create({ productId, userId, rating, description });
        console.log('Review: ', review);

        //const user = await User.findById(userId);
        //const avatar = user.avatar || 'default.jpg';
        
    
        res.status(200).json({ success: true, message: 'Review added successfully', review });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add review', error: error.message });
    }
};


// Fetch paginated reviews for a product
exports.getReviews = async (req, res) => {
    const { productId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 3; // Number of reviews per page
    const skip = (page - 1) * limit;

    try {
        const reviews = await Review.find({ productId })
            //.sort({ likes: -1 }) // Sort by most likes
            .sort({ createdAt: -1 }) // Sort by most recent
            .skip(skip)
            .limit(limit);

        const totalReviews = await Review.countDocuments({ productId });
        const hasMore = totalReviews > page * limit;
        //console.log(reviews);

        res.json({ success: true, reviews, hasMore });
    } catch (error) {
        res.json({ success: false, message: 'Failed to fetch reviews', error: error.message });
    }
};
