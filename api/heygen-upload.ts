import type { VercelRequest, VercelResponse } from "@vercel/node";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// Helper to run middleware in Vercel serverless environment
function runMiddleware(req: any, res: any, fn: any) {
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
    bodyParser: false, // Disable default Vercel parser to process multipart raw stream
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await runMiddleware(req, res, upload.single("file"));

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const apiKey = process.env.HEYGEN_API_KEY || req.headers["x-api-key"] || "";
    if (!apiKey) {
      return res.status(401).json({
        error: "HeyGen API Key is missing on the server and client headers.",
      });
    }

    // Convert Buffer to Web-native Blob
    const fileBlob = new Blob([req.file.buffer], {
      type: req.file.mimetype || "audio/mpeg",
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File(
        [fileBlob],
        req.file.originalname || "audio.mp3",
        {
          type: req.file.mimetype || "audio/mpeg",
        }
      )
    );

    const endpoint = "https://upload.heygen.com/v1/asset";
    console.log(`[PROXY-UPLOAD] Forwarding to HeyGen: ${endpoint}`);

    const heygenResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey as string,
      },
      body: formData,
    });

    const respText = await heygenResponse.text();
    let respJson: any = null;
    try {
      respJson = JSON.parse(respText);
    } catch { }

    if (!heygenResponse.ok) {
      console.error(
        `[PROXY-UPLOAD] HeyGen API Error (${heygenResponse.status}): ${respText}`
      );
      return res.status(heygenResponse.status).send(respText);
    }

    return res.status(200).json(respJson);
  } catch (error: any) {
    console.error("[PROXY-UPLOAD] General Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Server proxy upload failed" });
  }
}
