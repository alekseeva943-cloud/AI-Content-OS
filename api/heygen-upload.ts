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

    // Build multipart form
    const formData = new FormData();

    formData.append(
      "file",
      new Blob(
        [req.file.buffer],
        {
          type:
            req.file.mimetype ||
            "audio/mpeg",
        }
      ),
      req.file.originalname ||
        "audio.mp3"
    );

    formData.append(
      "asset_type",
      "audio"
    );

    formData.append(
      "title",
      req.file.originalname ||
        "audio.mp3"
    );

    // DIRECT upload endpoint
    const endpoint =
      "https://upload.heygen.com/v1/asset";

    console.log(
      `[HEYGEN-UPLOAD] Uploading to ${endpoint}`
    );

    const heygenResponse =
      await fetch(endpoint, {
        method: "POST",

        headers: {
          "X-Api-Key": apiKey,
        },

        body: formData,
      });

    const responseText =
      await heygenResponse.text();

    let responseJson: any = null;

    try {

      responseJson =
        JSON.parse(responseText);

    } catch {}

    if (!heygenResponse.ok) {

      console.error(
        `[HEYGEN-UPLOAD] Upload failed (${heygenResponse.status})`
      );

      console.error(responseText);

      return res
        .status(heygenResponse.status)
        .send(responseText);

    }

    console.log(
      "[HEYGEN-UPLOAD] Upload success"
    );

    return res.status(200).json({
      success: true,

      data: {
        asset_id:
          responseJson?.data?.asset_id,

        audio_url:
          responseJson?.data?.asset_url ||
          responseJson?.data?.url,
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