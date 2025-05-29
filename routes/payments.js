// const express = require("express");
// const router = express.Router();
// const Stripe = require("stripe");
// const authMiddleware = require("../middleware/authMiddleware");
// const { Course } = require("../models");

// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// router.post("/create-checkout-session", authMiddleware, async (req, res) => {
//   try {
//     const { courseId, courseName, coursePrice } = req.body;
//     const parsedCourseId = parseInt(courseId, 10);
//     const parsedPrice = parseFloat(coursePrice);

//     console.log("Create checkout session:", {
//       courseId,
//       parsedCourseId,
//       courseName,
//       coursePrice,
//       parsedPrice,
//       userId: req.user?.id,
//     });

//     // Validate inputs
//     if (
//       !parsedCourseId ||
//       isNaN(parsedCourseId) ||
//       !courseName?.trim() ||
//       isNaN(parsedPrice) ||
//       parsedPrice <= 0
//     ) {
//       console.log("Invalid data received:", {
//         courseId,
//         parsedCourseId,
//         courseName,
//         coursePrice,
//       });
//       return res
//         .status(400)
//         .json({ error: "Valid course ID, name, and price are required" });
//     }

//     // Verify course exists
//     const course = await Course.findByPk(parsedCourseId);
//     if (!course) {
//       console.log(`Course not found for ID: ${parsedCourseId}`);
//       return res
//         .status(404)
//         .json({ error: `Course not found for ID ${parsedCourseId}` });
//     }

//     // Validate course details
//     if (
//       course.title !== courseName ||
//       parseFloat(course.price) !== parsedPrice
//     ) {
//       console.log("Course details mismatch:", {
//         provided: { courseName, coursePrice: parsedPrice },
//         expected: { title: course.title, price: parseFloat(course.price) },
//       });
//       return res.status(400).json({ error: "Course details do not match" });
//     }

//     if (!process.env.STRIPE_SECRET_KEY || !process.env.FRONTEND_URL) {
//       console.error("Missing environment variables");
//       return res.status(500).json({ error: "Server configuration error" });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: courseName,
//               description: `Enrollment for course ID: ${parsedCourseId}`,
//             },
//             unit_amount: Math.round(parsedPrice * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/courses`,
//       metadata: {
//         userId: req.user.id.toString(),
//         courseId: parsedCourseId.toString(),
//       },
//     });

//     console.log("Checkout session created:", {
//       sessionId: session.id,
//       metadata: session.metadata,
//     });
//     res.json({ sessionId: session.id });
//   } catch (err) {
//     console.error("Error creating checkout session:", {
//       message: err.message,
//       stack: err.stack,
//     });
//     res.status(500).json({ error: "Failed to create checkout session" });
//   }
// });

// module.exports = router;



// ✅ FILE: CourseViewer.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { API_BASE_URL, STRIPE_PUBLIC_KEY } from "../../config";

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const CourseViewer = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to view courses");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/v1/courses/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const courseData = response.data;
        const formatted = {
          id: courseData.id?.toString(),
          name: courseData.title?.toString(),
          price: parseFloat(courseData.price) || 0,
          description: courseData.description || "No description available",
          teacher: courseData.teacher?.name || "Unknown",
        };

        setCourse(formatted);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load course");
        toast.error(err.response?.data?.error || "Failed to load course");
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  const handleEnroll = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to enroll");
      navigate("/login");
      return;
    }

    if (!course || !course.id || !course.name || isNaN(course.price)) {
      toast.error("Course data not loaded properly");
      return;
    }

    const payload = {
      courseId: course.id,
      courseName: course.name,
      coursePrice: course.price,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/payments/create-checkout-session`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({
        sessionId: response.data.sessionId,
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Enrollment failed");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="course-view-container">
      <h2>{course.name}</h2>
      <p>{course.description}</p>
      <p>Price: ${course.price.toFixed(2)}</p>
      <p>Instructor: {course.teacher}</p>
      <button onClick={handleEnroll} className="enroll-button">
        Enroll Now
      </button>
    </div>
  );
};

export default CourseViewer;
