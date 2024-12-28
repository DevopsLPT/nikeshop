const User = require('../../Auth/models/userModel');
const cloudinary = require('../../../config/cloudinary');
const path = require('path');
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
  
    res.render('Account/account', { title: 'Account', user: user }); // Render the profile view and pass user data
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.uploadAvatar = async (req, res) => {
  //console.log('File uploaded:', req.file); // Log the uploaded file info
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  
  try {
    // Update the user's avatar in the database
    const user = await User.findById(req.user.id); // Assuming req.user contains the logged-in user's data
    user.avatar = req.file.path; // Save the Cloudinary URL to the user's avatar field
    await user.save();
  
    res.redirect('/profile'); // Redirect to the profile page with the updated avatar
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading avatar');
  }
};


exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Assuming req.user contains the authenticated user's data
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Remove avatar from Cloudinary if needed
    if (user.avatar) {
      if (user.avatar.includes('res.cloudinary.com')) {
        // Handle Cloudinary avatar deletion
        const publicId = user.avatar.split('/').pop().split('.')[0]; // Extract public ID from URL
        await cloudinary.uploader.destroy(`avatars/${publicId}`);
      } else {
        console.log('Avatar is from an external source (e.g., Google), no deletion required.');
      }
    }

    // Clear avatar field in database
    user.avatar = null;
    await user.save();

    res.redirect('/profile'); // Redirect back to the profile page
  } catch (err) {
    console.error('Error deleting avatar:', err);
    res.status(500).send('Error deleting avatar');
  }
};
