// const baseUrl = "http://localhost:3005/";
// const express = require("express");
// const axios = require("axios");
// require("colors");
// const { v4: uuid } = require("uuid");

// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.set("view engine", "ejs");

// app.get("/", async (req, res) => {
//   res.render("index");
// });

// const initiatePayment = async (req, res, next) => {
//   const { cus_email, cus_name, cus_phone, amount, desc, currency } = req.body;

//   const formData = {
//     cus_name,
//     cus_email,
//     cus_phone,
//     amount,
//     tran_id: uuid(),
//     signature_key:"dbb74894e82415a2f7ff0ec3a97e4183",
//     store_id:"aamarpaytest", // Ensure this matches the store ID provided for sandbox testing
//     currency,
//     desc,
//     cus_add1: "53, Gausul Azam Road, Sector-14, Dhaka, Bangladesh",
//     cus_add2: "Dhaka",
//     cus_city: "Dhaka",
//     cus_country: "Bangladesh",
//     success_url: `${baseUrl}callback`,
//     fail_url: `${baseUrl}callback`,
//     cancel_url: `${baseUrl}callback`,
//     type: "json", // This is must required for JSON request
//   };

//   try {
//     const { data } = await axios.post("https://sandbox.aamarpay.com/jsonpost.php", formData);
//     console.log("Aamarpay Response: ", data);

//     if (data.result !== "true") {
//       let errorMessage = "";
//       for (let key in data) {
//         errorMessage += data[key] + ". ";
//       }
//       return res.render("error", {
//         title: "Error",
//         errorMessage,
//       });
//     }

//     res.status(200).send(data.payment_url);
//   } catch (error) {
//     console.error("Error communicating with Aamarpay: ", error.message);
//     res.status(500).send("Internal Server Error");
//   }
// }

// app.post("/callback", async (req, res, next) => {
//   const { pay_status, cus_name, cus_phone, cus_email, currency, pay_time, amount } = req.body;
//   res.render("callback", {
//     title: "Payment Status",
//     pay_status,
//     cus_name,
//     cus_phone,
//     cus_email,
//     currency,
//     pay_time,
//     amount,
//   });
  
// console.log("callback: ",req.body)
// });

// const port = 3005;

// app.listen(port, () => {
//   console.log(`Server is running on port: ${port}`.green.bold);
// });
