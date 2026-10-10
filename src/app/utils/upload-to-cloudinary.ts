import cloudinary from "../../config/cloudinary";

export const uploadToCloudinary = (
  buffer: Buffer,
  resourceType: "image" | "raw",
  folder: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result?.secure_url) {
          return reject(new Error("File upload failed"));
        }

        resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });
};
