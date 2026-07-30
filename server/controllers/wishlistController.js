import User from '../models/User.js';

// @desc    Get user's populated wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (user) {
      res.json(user.wishlist);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle item in wishlist
// @route   POST /api/wishlist
// @access  Private
const toggleWishlistItem = async (req, res) => {
  const { productId } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isWishlisted = user.wishlist.includes(productId);

    if (isWishlisted) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    const updatedUser = await User.findById(user._id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeWishlistItem = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.id);
    await user.save();

    const updatedUser = await User.findById(user._id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getWishlist, toggleWishlistItem, removeWishlistItem };
