import Subscriber from '../models/Subscriber.js';

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    await Subscriber.create({ email });
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This email is already subscribed' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};