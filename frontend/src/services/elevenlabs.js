// src/frontend/src/services/api.js

const ELEVENLABS_VOICE_ID = "pNInz6obpgDQGcFmaJgB";
// No longer need the full base URL, requests will go to the same origin
// handled by Nginx proxy
// const PYTHON_BACKEND_BASE_URL = "http://127.0.0.1:8000"; // Remove or comment out

export const callElevenLabs = async (apiKey, text) => {
  // This call goes directly to ElevenLabs, no change needed here
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;
  const headers = { /* ... */ };
  const body = JSON.stringify({ /* ... */ });
  const response = await fetch(url, { method: 'POST', headers, body });
  if (!response.ok) { /* ... error handling ... */ throw new Error(/* ... */); }
  return response.blob();
};

/**
 * Uploads audio and image to the backend via the Nginx proxy.
 * @param {Blob} audioBlob - The generated audio Blob.
 * @param {File} imageFile - The user's uploaded image file.
 * @returns {Promise<{videoFilename: string}>} - Resolves with object containing filename.
 */
export const uploadForVideo = async (audioBlob, imageFile) => {
  const formData = new FormData();
  formData.append('audio_file', audioBlob, `audio-${Date.now()}.mp3`);
  formData.append('image_file', imageFile);

  // Use relative path - Nginx will proxy this to the backend
  const uploadUrl = `/api/generate-video`; // CHANGED

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
     // ... (error handling) ...
     let errorMsg = `Backend Server Error: ${response.status} ${response.statusText}`;
     try { /* ... */ } catch (e) { /* ... */ }
     throw new Error(errorMsg);
  }
  return response.json();
};

/**
 * Constructs the relative URL to download/view the generated video via Nginx proxy.
 * @param {string} filename - The filename received from the backend.
 * @returns {string} - The relative URL.
 */
export const getVideoUrl = (filename) => {
    const cleanFilename = filename.startsWith('/') ? filename.substring(1) : filename;
    // Use relative path - Nginx will proxy this to the backend's /videos/ endpoint
    return `/videos/${cleanFilename}`; // CHANGED
};