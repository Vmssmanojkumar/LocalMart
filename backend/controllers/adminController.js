import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// @desc    Get Admin Dashboard Stats & Activity
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalRetailers = await User.countDocuments({ role: "retailer" });
    const approvedRetailers = await User.countDocuments({ role: "retailer", isApproved: true });
    const pendingRetailers = await User.countDocuments({ role: "retailer", isApproved: false });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Recent user registrations
    const recentRegistrations = await User.find({ role: "customer" })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent retailer requests
    const recentRetailerRequests = await User.find({ role: "retailer", isApproved: false })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalRetailers,
        approvedRetailers,
        pendingRetailers,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
      recentRegistrations,
      recentRetailerRequests,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (customers and admins)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["customer", "admin"] } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all retailers
// @route   GET /api/admin/retailers
// @access  Private/Admin
export const getRetailers = async (req, res) => {
  try {
    const retailers = await User.find({ role: "retailer" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(retailers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve Retailer Account
// @route   PUT /api/admin/retailers/:id/approve
// @access  Private/Admin
export const approveRetailer = async (req, res) => {
  try {
    const retailer = await User.findById(req.params.id);

    if (!retailer) {
      return res.status(404).json({ message: "Retailer not found" });
    }

    if (retailer.role !== "retailer") {
      return res.status(400).json({ message: "User is not a retailer" });
    }

    retailer.isApproved = true;
    await retailer.save();

    res.json({
      message: "Retailer approved successfully",
      retailer: {
        _id: retailer._id,
        name: retailer.name,
        email: retailer.email,
        role: retailer.role,
        isApproved: retailer.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject Retailer Account
// @route   PUT /api/admin/retailers/:id/reject
// @access  Private/Admin
export const rejectRetailer = async (req, res) => {
  try {
    const retailer = await User.findById(req.params.id);

    if (!retailer) {
      return res.status(404).json({ message: "Retailer not found" });
    }

    if (retailer.role !== "retailer") {
      return res.status(400).json({ message: "User is not a retailer" });
    }

    retailer.isApproved = false; // rejects or keeps pending
    await retailer.save();

    res.json({
      message: "Retailer rejected / set to pending successfully",
      retailer: {
        _id: retailer._id,
        name: retailer.name,
        email: retailer.email,
        role: retailer.role,
        isApproved: retailer.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update any User / Retailer account
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update common fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    // Update retailer-specific fields if it's a retailer
    if (user.role === "retailer") {
      user.shopName = req.body.shopName || user.shopName;
      user.gstNumber = req.body.gstNumber || user.gstNumber;
      user.address = req.body.address || user.address;
      if (req.body.isApproved !== undefined) {
        user.isApproved = req.body.isApproved;
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      shopName: updatedUser.shopName,
      gstNumber: updatedUser.gstNumber,
      address: updatedUser.address,
      isApproved: updatedUser.isApproved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account (customer/admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete retailer account
// @route   DELETE /api/admin/retailers/:id
// @access  Private/Admin
export const deleteRetailer = async (req, res) => {
  try {
    const retailer = await User.findById(req.params.id);

    if (!retailer) {
      return res.status(404).json({ message: "Retailer not found" });
    }

    // Delete associated products
    await Product.deleteMany({ retailer: retailer._id.toString() });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Retailer and their products deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
