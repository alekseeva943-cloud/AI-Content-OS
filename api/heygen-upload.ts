// api/heygen-upload.ts

import type {
  VercelRequest,
  VercelResponse
} from "@vercel/node";

import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
});

// Helper for Vercel middleware
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

    // Parse multipart/form-data
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
      `[PROXY-UPLOAD] Received file: ${req.file.originalname}`
    );

    // Convert buffer → blob
    const fileBlob = new Blob(
      [req.file.buffer],
      {
        type:
          req.file.mimetype ||
          "audio/mpeg",
      }
    );

    // IMPORTANT:
    // HeyGen upload schema
    const formData = new FormData();

    formData.append(
      "file",
      new File(
        [fileBlob],
        req.file.originalname ||
          "audio.mp3",
        {
          type:
            req.file.mimetype ||
            "audio/mpeg",
        }
      )
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

    const endpoint =
      "https://upload.heygen.com/v1/asset";

    console.log(
      `[PROXY-UPLOAD] Forwarding to HeyGen: ${endpoint}`
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

    // ERROR
    if (!heygenResponse.ok) {

      console.error(
        `[PROXY-UPLOAD] HeyGen API Error (${heygenResponse.status})`
      );

      console.error(responseText);

      return res
        .status(heygenResponse.status)
        .send(responseText);

    }

    console.log(
      "[PROXY-UPLOAD] Upload success"
    );

    return res.status(200).json(
      responseJson
    );

  } catch (error: any) {

    console.error(
      "[PROXY-UPLOAD] Fatal Error:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Server proxy upload failed",
    });

  }
}