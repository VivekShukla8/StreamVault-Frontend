export async function uploadToCloudinary(file, folder) {
  if (!file) throw new Error("No file provided");

  // detect type
  const type = file.type.startsWith("video/") ? "video" : "image";

  // ask backend for signature (include folder in query)
  const res = await fetch(
    `http://localhost:8000/api/v1/cloudinary/sign-upload?folder=${folder}`
  );

  if (!res.ok) throw new Error("Failed to get signature from backend");
  const { signature, timestamp, apiKey, cloudName } = await res.json();

  // build form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  // upload to cloudinary
  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await cloudRes.json();
  console.log("Cloudinary response:", data);

  if (!data.url) throw new Error("Cloudinary upload failed");
  return data;
}
