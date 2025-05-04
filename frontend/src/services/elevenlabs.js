// src/frontend/src/services/api.js

const ELEVENLABS_VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Adam's Voice ID
// Base URL for your FastAPI backend (ensure this is correct for your setup)
const PYTHON_BACKEND_BASE_URL = "http://127.0.0.1:8000"; // Or http://localhost:8000

/**
 * Calls the ElevenLabs API to generate speech.
 * @param {string} apiKey - The user's ElevenLabs API key.
 * @param {string} text - The text prompt.
 * @returns {Promise<Blob>} - A promise that resolves with the audio Blob.
 */
export const callElevenLabs = async (apiKey, text) => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;
  const headers = {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': apiKey,
  };
  const body = JSON.stringify({
    text: text,
    model_id: "eleven_flash_v2_5",
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: body,
  });

  if (!response.ok) {
    let errorMsg = `ElevenLabs API Error: ${response.status} ${response.statusText}`;
    try {
        const errorData = await response.json();
        errorMsg = errorData?.detail?.message || errorMsg;
    } catch (e) { /* Ignore */ }
    throw new Error(errorMsg);
  }

  return response.blob();
};

/**
 * Uploads audio and image to the backend for video generation.
 * @param {Blob} audioBlob - The generated audio Blob.
 * @param {File} imageFile - The user's uploaded image file.
 * @returns {Promise<{videoFilename: string}>} - Resolves with object containing the filename.
 */
export const uploadForVideo = async (audioBlob, imageFile) => {
  const formData = new FormData();
  // Ensure filenames are provided for blobs
  formData.append('audio_file', audioBlob, `audio-${Date.now()}.mp3`);
  formData.append('image_file', imageFile);

  const uploadUrl = `${PYTHON_BACKEND_BASE_URL}/api/generate-video`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
    // No 'Content-Type' needed for FormData, browser sets it with boundary
  });

  if (!response.ok) {
     let errorMsg = `Backend Server Error: ${response.status} ${response.statusText}`;
     try {
        const errorData = await response.json();
        errorMsg = errorData?.error || errorData?.message || errorData?.detail || errorMsg;
     } catch (e) { /* Ignore */ }
     throw new Error(errorMsg);
  }

  // Expect JSON like { "videoFilename": "some_uuid.mp4" }
  return response.json();
};


/**
 * Constructs the full URL to download/view the generated video via the new endpoint.
 * @param {string} filename - The filename received from the backend.
 * @returns {string} - The full URL.
 */
export const getVideoUrl = (filename) => {
    // Ensure filename doesn't have leading slashes if base URL is used
    const cleanFilename = filename.startsWith('/') ? filename.substring(1) : filename;
    // Construct URL using the new /videos/ endpoint
    return `${PYTHON_BACKEND_BASE_URL}/videos/${cleanFilename}`;
};
