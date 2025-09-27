import { instance } from "../config/razorpayConfig.js";
import crypto from "crypto";
import { Payment } from "../models/paymentModel.js";
import User from "../models/userModel.js";
import axios from "axios";
import Donation from "../models/donationModel.js";
import Project from "../models/projectModel.js";


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

export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, projectID, userID } = req.body;

    console.log(projectID.projectId, userID);

  

    console.log("Payment verification reached!");

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
    const user = await User.findOne({ _id: userID });
    console.log(user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }


    // Create Razorpay customer
    const auth = Buffer.from(`${process.env.RAZORPAY_API_KEY}:${process.env.RAZORPAY_API_SECRET}`).toString('base64');
    let customer;

    if (user.customerID != null) {
      const customerResponse = await axios.get(
        `https://api.razorpay.com/v1/customers/${user.customerID}`,
        {
          headers: { Authorization: `Basic ${auth}`},
        }
      );
      customer = customerResponse.data;
      console.log("Customer retrieved successfully:", customer);
    } else {
      const bodyForCustomer = {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        contact: user.phone,
        fail_existing: "1",
      };  

      const customerResponse = await axios.post(
        `https://api.razorpay.com/v1/customers`,
        bodyForCustomer,
        {
          headers: { Authorization: `Basic ${auth}` },
        }
      );
      customer = customerResponse.data;
      console.log("line 118", customer)
      // Update user's customer ID in the database
      await User.findByIdAndUpdate(
        user._id,
        { customerID: customer.id },
        { new: true }
      );
      
    }

    // Create Razorpay item
    const bodyForItem = {
      name: "Donation",
      description: "Donation for Project",
      amount: amount * 100,
      currency: "INR",
    };

    const itemResponse = await axios.post(
      "https://api.razorpay.com/v1/items",
      bodyForItem,
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    const item = itemResponse.data;

    // console.log("Item created:", item);

    // Create Razorpay invoice
    const bodyForInvoice = {
      type: "invoice",
      date: Math.floor(Date.now() / 1000),
      customer_id: customer.id,
      line_items: [{ item_id: item.id }],
    };

    const invoiceResponse = await axios.post(
      "https://api.razorpay.com/v1/invoices",
      bodyForInvoice,
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    const invoiceData = invoiceResponse.data;

    // console.log("Invoice created:", invoiceData);


    const donation = await Donation.create({
      projectID: projectID.projectId,
      donationFrom : userID,
      transactionID: razorpay_payment_id,
      invoicePdfURL: invoiceData.short_url,
      invoiceID : invoiceData.id,
      createdAt: Date.now(),
      amount: amount
    })


    // console.log(user._id)
    
    await Project.findByIdAndUpdate(
      { _id: projectID.projectId },
      {
        $push: {
          donations: {donator: userID, donationID : donation._id, donationAmount: amount },
        },
      },
      { new: true, useFindAndModify: false }
    );
    
  


    // Respond with the invoice short URL
    res.status(200).json({
      "message" : "Donation Successfull",
      donationID : donation._id,
      invoice_url: invoiceData.short_url,
      amount: amount,
      success: true,
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