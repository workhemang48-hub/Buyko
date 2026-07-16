import Address from '../models/Address.js';

const unsetOtherDefaults = async (userId, excludeId = null) => {
  await Address.updateMany(
    { user: userId, ...(excludeId && { _id: { $ne: excludeId } }) },
    { isDefault: false }
  );
};

export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createAddress = async (req, res) => {
  try {
    const existingCount = await Address.countDocuments({ user: req.user._id });
    const isFirstAddress = existingCount === 0;

    const addressData = {
      ...req.body,
      user: req.user._id,
      isDefault: isFirstAddress ? true : !!req.body.isDefault,
    };

    const address = await Address.create(addressData);

    if (address.isDefault) {
      await unsetOtherDefaults(req.user._id, address._id);
    }

    res.status(201).json(address);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    Object.assign(address, req.body);
    await address.save();

    if (address.isDefault) {
      await unsetOtherDefaults(req.user._id, address._id);
    }

    res.json(address);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    address.isDefault = true;
    await address.save();
    await unsetOtherDefaults(req.user._id, address._id);

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};