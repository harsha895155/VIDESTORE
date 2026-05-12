import { useState, useEffect } from "react";
import axios from "axios";

export const useSupportEmail = () => {
  const [email, setEmail] = useState("vibestore2027@gmail.com"); // Fallback email

  useEffect(() => {
    // If you have a configured axios instance, you might use that instead
    // We'll use axios here assuming it's available and configured
    axios.get("/api/contact")
      .then((res) => {
        if (res.data && res.data.email) {
          setEmail(res.data.email);
        }
      })
      .catch((err) => {
        console.error("Failed to load support email, using fallback:", err);
      });
  }, []);

  return email;
};
