const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;
const userService = require("../services/user-service");
const UserDto = require("../dtos/user-dto");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

class ActivateController {
  async activate(req, res) {
    const { name, avatar } = req.body;
    // Validate input
    if (!name || !avatar) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Validate avatar format
    if (!avatar.startsWith("data:image/")) {
      return res.status(400).json({ message: "Invalid avatar format!" });
    }

    const supportedFormats = ["png", "jpeg", "jpg"];
    const mimeTypeMatch = avatar.match(/^data:image\/(.*);base64,/);

    if (!mimeTypeMatch || !supportedFormats.includes(mimeTypeMatch[1])) {
      return res.status(400).json({
        message: `Unsupported image format: ${
          mimeTypeMatch ? mimeTypeMatch[1] : "unknown"
        }`,
      });
    }

    // Check image size limit
    const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB
    const imageBase64 = avatar.split(",")[1];
    if (Buffer.byteLength(imageBase64, "base64") > MAX_IMAGE_SIZE) {
      return res.status(400).json({ message: "Image size exceeds 8MB limit!" });
    }

    try {
      // Convert Base64 to Buffer
      const buffer = Buffer.from(imageBase64, "base64");

      // Resize the image using Sharp
      const resizedBuffer = await sharp(buffer).resize(50).toBuffer();

      // Upload resized image to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(
        `data:image/${mimeTypeMatch[1]};base64,${resizedBuffer.toString(
          "base64"
        )}`,
        {
          folder: "my-images",
        }
      );

      // Validate `req.user`
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized!" });
      }

      const userId = req.user._id;

      // Update user data
      const user = await userService.findUser({ _id: userId });
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }
      user.activated = true;
      user.name = name;
      user.avatar = cloudinaryResponse.secure_url;

      await user.save();
      // Respond with updated user data
      res.json({ user: new UserDto(user), auth: true });
    } catch (error) {
      console.error("Error in activation process:", error);
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
}
module.exports = new ActivateController();
