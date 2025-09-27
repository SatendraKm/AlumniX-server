import { instance } from "../config/razorpayConfig.js";
import Fund from "../models/fundModel.js";
import crypto from "crypto";
import Funding from "../models/fundingModel.js";
import { Payment } from "../models/paymentModel.js"
import User from "../models/userModel.js";
import axios from "axios";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/imageUploader.js";

export const createFund = async (req, res) => {
  try {
    const { title, description, creator } = req.body;
    const fundImage = req.files?.fundImage;

    // Validate required fields
    if (!title || !description || !creator) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    if (!fundImage) {
      return res.status(400).json({
        success: false,
        message: "Image Not Found",
      });
    }


    let fundUrl = "";
    if (fundImage) {
      const image = await uploadImageToCloudinary(fundImage, process.env.FOLDER_NAME, 1000, 1000);
      fundUrl = image.secure_url;
    }


    // Create the fund
    const fund = await Fund.create({
      title,
      description,
      creator,
      fundImage: fundUrl,
      currentAmount: 0,
    });

    res.status(201).json({
      success: true,
      message: "Fund created successfully!",
      fund,
    });
  } catch (error) {
    console.error("Error creating fund:", error);
    res.status(500).json({ success: false, message: "Internal server error", error });
  }
};

export const getFundDetails = async (req, res) => {
  try {
    const { fundID } = req.params;

    // Find the fund and populate funding details
    const fund = await Fund.findById(fundID)
      .populate({
        path: "funding.fundingID", // Populate funding details
        select: "amount transactionID invoicePdfURL", // Select specific fields from Funding
      })
      .populate({
        path: "funding.funder", // Populate funder details
        select: "name email", // Customize the user details you want to include
      });

    if (!fund) {
      return res.status(404).json({ success: false, message: "Fund not found!" });
    }

    res.status(200).json({
      success: true,
      fund,
    });
  } catch (error) {
    console.error("Error fetching fund details:", error);
    res.status(500).json({ success: false, message: "Internal server error", error });
  }
};

export const getAllFunds = async (req, res) => {
  try {
    const funds = await Fund.find();

    res.status(200).json({
      success: true,
      funds,
    });
  } catch (error) {
    console.error("Error fetching funds:", error);
    res.status(500).json({ success: false, message: "Internal server error", error });
  }
};

// Razorpay checkout for funding
export const checkout = async (req, res) => {
  try {
    console.log("checkout");

    // Options for creating the order
    const options = {
      amount: Number(req.body.amount) * 100,
      currency: "INR",
    };

    // Create the order
    const order = await instance.orders.create(options);

    // Respond with success and order details
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    // Handle errors gracefully
    console.error("Error in checkout:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while creating the order.",
      error: error.message || "Unknown error",
    });
  }
};

// Payment verification and funding addition
export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, fundId, userID } = req.body;

    console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, fundId, userID);

    console.log("Payment verification initiated...");

    // Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature.",
      });
    }

    // Save payment details to the database
    const payment = new Payment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    await payment.save();

    // Fetch user details
    const user = await User.findById({ _id : userID });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if the fund exists
    const fund = await Fund.findById(fundId);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Fund not found.",
      });
    }

    // Create Razorpay customer if not already created
    const auth = Buffer.from(`${process.env.RAZORPAY_API_KEY}:${process.env.RAZORPAY_API_SECRET}`).toString("base64");
    let customer;

    if (user.customerID) {
      const customerResponse = await axios.get(`https://api.razorpay.com/v1/customers/${user.customerID}`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      customer = customerResponse.data;
    } else {
      const bodyForCustomer = {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        contact: user.phone,
        fail_existing: "1",
      };

      const customerResponse = await axios.post("https://api.razorpay.com/v1/customers", bodyForCustomer, {
        headers: { Authorization: `Basic ${auth}` },
      });
      customer = customerResponse.data;

      // Update user's customer ID in the database
      await User.findByIdAndUpdate(
        user._id,
        { customerID: customer.id },
        { new: true }
      );
    }

    // Create Razorpay item
    const bodyForItem = {
      name: "Fund Contribution",
      description: "Contribution to fund",
      amount: amount * 100,
      currency: "INR",
    };

    const itemResponse = await axios.post("https://api.razorpay.com/v1/items", bodyForItem, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const item = itemResponse.data;

    // Create Razorpay invoice
    const bodyForInvoice = {
      type: "invoice",
      date: Math.floor(Date.now() / 1000), // Current timestamp in seconds
      customer_id: customer.id,
      line_items: [{ item_id: item.id }],
    };

    const invoiceResponse = await axios.post("https://api.razorpay.com/v1/invoices", bodyForInvoice, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const invoiceData = invoiceResponse.data;

    // Create funding record in Funding model
    const funding = await Funding.create({
      fundingID: fundId,
      fundingFrom: user._id,
      transactionID: razorpay_payment_id,
      invoicePdfURL: invoiceData.short_url,
      invoiceID: invoiceData.id,
      amount,
      createdAt: Date.now(),
    });

    // Update Fund with the new funding record
    await Fund.findByIdAndUpdate(
      {_id : fundId} ,
      {
        $inc: { currentAmount: amount }, // Increment the current amount
      },
      { new: true }
    );

    // Respond with success and invoice details
    res.status(200).json({
      success: true,
      message: "Payment verified and funding added successfully!",
      fundingID: funding._id,
      invoice_url: invoiceData.short_url,
      amount,
    });
  } catch (error) {
    console.error("Error in payment verification:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during payment verification.",
      error: error.message || "Unknown error",
    });
  }
};


// All Users Funding at specific fund
export const allUsersFunding = async (req, res) => {
  try {
    const fundID = req.params.id;

    // Fetch all fundings related to the specified fund
    const fundings = await Funding.find({ fundingID: fundID });

    if (!fundings.length) {
      return res.status(404).json({ message: "No fundings found for this fund." });
    }

    // Aggregate fundings by each user and sum their amounts
    const fundingSummary = fundings.reduce((acc, funding) => {
      const userID = funding.fundingFrom.toString(); // Ensure it's a string
      acc[userID] = (acc[userID] || 0) + funding.amount;
      return acc;
    }, {});

    // Convert the aggregated data into an array of objects
    const result = Object.entries(fundingSummary).map(([userID, amount]) => ({
      _id: userID,
      amount: amount,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// donation details for a specific donation
export const userFundingPerFund = async (req, res) => {
  try {
    const userID = req.params.id;

    // Fetch all fundings made by the specified user
    const fundings = await Funding.find({ fundingFrom: userID });

    if (!fundings.length) {
      return res.status(404).json({ message: "No fundings found for this user." });
    }

    // Aggregate fundings by each fund and sum their amounts
    const fundingSummary = fundings.reduce((acc, funding) => {
      const fundID = funding.fundingID.toString(); // Ensure it's a string
      acc[fundID] = (acc[fundID] || 0) + funding.amount;
      return acc;
    }, {});

    // Convert the aggregated data into an array of objects
    const result = Object.entries(fundingSummary).map(([fundID, amount]) => ({
      fundID: fundID,
      amount: amount,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};




