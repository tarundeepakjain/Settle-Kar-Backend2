import { supabase } from "../config/supabase.js";

export const Authentication= async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header"
      });
    }

    const token = authHeader.split(" ")[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // ✅ trusted user
    req.user = user;
    next();

  } catch (err) {
    next(err);
  }
};
