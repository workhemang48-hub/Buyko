import User from '../models/User.js';
import Order from '../models/Order.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim(), phone: phone || undefined },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const updateMyEmail = async (req, res) => {
  try {
    const { newEmail, currentPassword } = req.body;

    if (!newEmail || !currentPassword) {
      return res.status(400).json({ message: 'New email and current password are required' });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (normalizedEmail === user.email) {
      return res.status(400).json({ message: 'This is already your current email' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already in use' });
    }

    user.email = normalizedEmail;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const toggleUserRole = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    targetUser.role = targetUser.role === 'admin' ? 'customer' : 'admin';
    await targetUser.save();

    const updatedUser = await User.findById(targetUser._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Toggle role error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const orderCount = await Order.countDocuments({ user: targetUser._id });
    if (orderCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: this user has ${orderCount} order(s) on record`,
      });
    }

    await User.findByIdAndDelete(targetUser._id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};