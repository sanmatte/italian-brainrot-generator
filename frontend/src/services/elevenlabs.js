// src/frontend/src/services/elevenlabs.js

// Voice ID for ElevenLabs (Adam)
const ELEVENLABS_VOICE_ID = "pNInz6obpgDQGcFmaJgB";

// --- Function to call ElevenLabs API (Client-Side) ---
/**
 * Calls the ElevenLabs API directly from the browser to generate speech.
 * @param {string} apiKey - The user's ElevenLabs API key.
 * @param {string} text - The text prompt.
 * @returns {Promise<Blob>} - A promise that resolves with the audio Blob.
 * @throws {Error} If the API call fails.
 */
export const callElevenLabs = async (apiKey, text) => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;
  const headers = {
    'Accept': 'audio/mpeg', // Expect MP3 audio
    'Content-Type': 'application/json',
    'xi-api-key': apiKey, // User's API Key
  };
  // Configure TTS options (model, voice settings)
  const body = JSON.stringify({
    text: text,
    model_id: "eleven_multilingual_v2", // Or your preferred model
    // voice_settings: { // Optional: Adjust stability/similarity if needed
    //   stability: 0.7,
    //   similarity_boost: 0.7
    // }
  });

  console.log("Calling ElevenLabs API..."); // Log start
  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: body,
  });

  if (!response.ok) {
    console.error("ElevenLabs API Error Response:", response);
    let errorMsg = `ElevenLabs API Error: ${response.status} ${response.statusText}`;
    try {
        // Try to get more specific error message from ElevenLabs response body
        const errorData = await response.json();
        errorMsg = errorData?.detail?.message || errorMsg;
    } catch (e) {
        console.warn("Could not parse ElevenLabs error response as JSON.");
    }
    // Throw error to be caught by the calling component
    throw new Error(errorMsg);
  }

  console.log("ElevenLabs API call successful, receiving audio blob.");
  // Return the audio data as a Blob
  return response.blob();
};


// --- Function to upload files to YOUR backend (via Nginx Proxy) ---
/**
 * Uploads the generated audio blob and the user's image file
 * to the backend server for video processing.
 * Uses a relative path, expecting Nginx to proxy the request.
 * @param {Blob} audioBlob - The generated audio Blob from ElevenLabs.
 * @param {File} imageFile - The user's uploaded image file.
 * @returns {Promise<{videoFilename: string}>} - Resolves with an object containing the filename of the generated video.
 * @throws {Error} If the upload or backend processing fails.
 */
export const uploadForVideo = async (audioBlob, imageFile) => {
  const formData = new FormData();
  // Append files with appropriate names for the backend
  formData.append('audio_file', audioBlob, `audio-${Date.now()}.mp3`);
  formData.append('image_file', imageFile);

  // Use the relative path configured in Nginx proxy
  const uploadUrl = `/api/generate-video`;

  console.log(`Uploading files to backend endpoint: ${uploadUrl}`);
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
    // Browser sets Content-Type for FormData automatically (multipart/form-data)
  });

  if (!response.ok) {
     console.error("Backend Upload/Processing Error Response:", response);
     let errorMsg = `Backend Server Error: ${response.status} ${response.statusText}`;
     try {
        // Try to get more specific error message from backend response body
        const errorData = await response.json();
        errorMsg = errorData?.error || errorData?.message || errorData?.detail || errorMsg;
     } catch (e) {
        console.warn("Could not parse backend error response as JSON.");
     }
     // Throw error to be caught by the calling component
     throw new Error(errorMsg);
  }

  console.log("Backend upload successful, receiving video filename.");
  // Expect backend to return JSON like: { "videoFilename": "some_uuid.mp4" }
  return response.json();
};


// --- Function to construct the video URL (via Nginx Proxy) ---
/**
 * Constructs the relative URL to download/view the generated video.
 * Uses a relative path, expecting Nginx to proxy the request to the backend's /videos/ endpoint.
 * @param {string} filename - The filename received from the backend.
 * @returns {string} - The relative URL to access the video.
 */
export const getVideoUrl = (filename) => {
    // Ensure filename doesn't have leading slashes which might break relative pathing
    const cleanFilename = filename.startsWith('/') ? filename.substring(1) : filename;
    // Use relative path - Nginx proxies this to backend's /videos/ endpoint
    const relativeUrl = `/videos/${cleanFilename}`;
    console.log(`Constructed video URL: ${relativeUrl}`);
    return relativeUrl;
};