// api/heygen-upload.ts

import type {
  VercelRequest,
  VercelResponse
} from "@vercel/node";

import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
});

// Run multer inside Vercel
function runMiddleware(
  req: any,
  res: any,
  fn: any
) {
  return new Promise((resolve, reject) => {

    fn(req, res, (result: any) => {

      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);

    });

  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: any,
  res: any
) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method Not Allowed",
    });

  }

  try {

    // Parse multipart upload
    await runMiddleware(
      req,
      res,
      upload.single("file")
    );

    if (!req.file) {

      return res.status(400).json({
        error: "No file uploaded",
      });

    }

    const apiKey =
      process.env.HEYGEN_API_KEY;

    if (!apiKey) {

      return res.status(401).json({
        error:
          "HEYGEN_API_KEY missing in Vercel environment variables.",
      });

    }

    console.log(
      `[HEYGEN-UPLOAD] Received file: ${req.file.originalname}`
    );

    // STEP 1:
    // Request upload URL from HeyGen

    const initResponse =
      await fetch(
        "https://api.heygen.com/v1/asset.upload",
        {
          method: "POST",

          headers: {
            "X-Api-Key": apiKey,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            content_type:
              req.file.mimetype ||
              "audio/mpeg",

            file_name:
              req.file.originalname ||
              "audio.mp3",

            folder: "uploads",
          }),
        }
      );

    const initText =
      await initResponse.text();

    let initJson: any = null;

    try {

      initJson =
        JSON.parse(initText);

    } catch {}

    if (!initResponse.ok) {

      console.error(
        "[HEYGEN-UPLOAD] Failed requesting upload URL"
      );

      console.error(initText);

      return res
        .status(initResponse.status)
        .send(initText);

    }

    const uploadUrl =
      initJson?.data?.upload_url;

    const assetId =
      initJson?.data?.asset_id;

    if (!uploadUrl) {

      return res.status(500).json({
        error:
          "HeyGen upload URL missing.",
      });

    }

    console.log(
      "[HEYGEN-UPLOAD] Upload URL received"
    );

    // STEP 2:
    // Upload binary directly

    const binaryUpload =
      await fetch(uploadUrl, {
        method: "PUT",

        headers: {
          "Content-Type":
            req.file.mimetype ||
            "audio/mpeg",
        },

        body: req.file.buffer,
      });

    const binaryText =
      await binaryUpload.text();

    if (!binaryUpload.ok) {

      console.error(
        "[HEYGEN-UPLOAD] Binary upload failed"
      );

      console.error(binaryText);

      return res
        .status(binaryUpload.status)
        .send(binaryText);

    }

    console.log(
      "[HEYGEN-UPLOAD] Binary upload success"
    );

    // STEP 3:
    // Return asset info

    return res.status(200).json({
      success: true,

      data: {
        asset_id: assetId,

        audio_url:
          initJson?.data?.asset_url ||
          initJson?.data?.url,
      },
    });

  } catch (error: any) {

    console.error(
      "[HEYGEN-UPLOAD] Fatal Error:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Server proxy upload failed",
    });

  }
}