// src/frontend/src/pages/HomePage.jsx
import React, { useState, useRef, useCallback } from 'react';
import ProgressDisplay from '../components/ProgressDisplay'; // Ensure path is correct
// Import API functions including getVideoUrl
import { callElevenLabs, uploadForVideo, getVideoUrl } from '../services/elevenlabs'; // Ensure path is correct

const initialProgressSteps = [
  { id: 'validate', label: 'Validating Input', status: 'pending', message: '' },
  { id: 'elevenlabs', label: 'Calling ElevenLabs API', status: 'pending', message: '' },
  { id: 'upload', label: 'Uploading Files to Server', status: 'pending', message: '' },
  // Removed 'processing' step as backend now handles it synchronously before responding
  { id: 'complete', label: 'Complete', status: 'pending', message: '' },
];

function HomePage() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [progressSteps, setProgressSteps] = useState(initialProgressSteps);
  const [isLoading, setIsLoading] = useState(false);
  const [rawAudioUrl, setRawAudioUrl] = useState(null); // For <audio> preview
  const [finalVideoUrl, setFinalVideoUrl] = useState(null); // For download link
  const [error, setError] = useState(null);

  const imageInputRef = useRef(null);
  const currentAudioUrl = useRef(null); // To revoke previous blob URL

  const updateStepStatus = useCallback((stepId, status, message = '') => {
    setProgressSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, status, message } : step
      )
    );
    if (status === 'error') {
      setError(message || `An error occurred during the '${stepId}' step.`);
      // Mark completion as error too if a step fails
      setProgressSteps(prevSteps =>
         prevSteps.map(step => step.id === 'complete' ? { ...step, status: 'error' } : step)
      );
    }
  }, []); // Added error state dependency

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);
    setRawAudioUrl(null);
    setFinalVideoUrl(null);
    // Reset progress steps to initial state
    setProgressSteps(initialProgressSteps.map(step => ({ ...step, status: 'pending', message: '' })));


    // Revoke previous blob URL
    if (currentAudioUrl.current) {
        URL.revokeObjectURL(currentAudioUrl.current);
        currentAudioUrl.current = null;
    }

    updateStepStatus('validate', 'inprogress');
    let validationPassed = true;
    // Use function scope error messages array
    const validationErrors = [];
    if (!apiKey) { validationErrors.push('API Key required.'); validationPassed = false; }
    if (!prompt) { validationErrors.push('Text prompt required.'); validationPassed = false; }
    if (!imageFile) { validationErrors.push('Image file required.'); validationPassed = false; }

    if (!validationPassed) {
      const errorMsg = validationErrors.join(' ');
      updateStepStatus('validate', 'error', errorMsg);
      setIsLoading(false);
      return;
    }
    updateStepStatus('validate', 'success');

    let audioBlob = null;

    try {
      updateStepStatus('elevenlabs', 'inprogress');
      audioBlob = await callElevenLabs(apiKey, prompt);
      const objectUrl = URL.createObjectURL(audioBlob);
      currentAudioUrl.current = objectUrl;
      setRawAudioUrl(objectUrl);
      updateStepStatus('elevenlabs', 'success');

      updateStepStatus('upload', 'inprogress');
      const uploadResponse = await uploadForVideo(audioBlob, imageFile);
      // Processing happens before backend responds in this model
      updateStepStatus('upload', 'success', 'Files processed by server.');


      if (!uploadResponse || !uploadResponse.videoFilename) {
          // Mark upload step as error if filename is missing
          updateStepStatus('upload', 'error', 'Server did not return video filename.');
          throw new Error("Backend did not return a valid video filename.");
      }

      // Construct the full URL using the filename from response
      const fullVideoUrl = getVideoUrl(uploadResponse.videoFilename);
      setFinalVideoUrl(fullVideoUrl);

      updateStepStatus('complete', 'success', 'Video ready for download!');

    } catch (err) {
      console.error("Generation process failed:", err);
      // Find which step was last marked as in progress and mark it as error
      let errorSet = false;
      setProgressSteps(prevSteps => {
         const newSteps = [...prevSteps]; // Create mutable copy
         for (let i = newSteps.length - 1; i >= 0; i--) {
              if (newSteps[i].status === 'inprogress') {
                  newSteps[i] = { ...newSteps[i], status: 'error', message: err.message };
                  errorSet = true;
                  break;
              }
         }
         // Mark completion as error
         const completeIndex = newSteps.findIndex(step => step.id === 'complete');
         if (completeIndex !== -1) {
            newSteps[completeIndex] = { ...newSteps[completeIndex], status: 'error'};
         }
         return newSteps;
      });
       // Set general error if not caught by step update
       if (!errorSet) {
           setError(err.message || 'An unknown error occurred.');
       }
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX Rendering ---
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Input Column - No changes needed here */}
        <div className="bg-gradient-to-br from-green-50 via-white to-red-50 p-6 md:p-8 shadow-lg rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-700">
            Create Your Masterpiece
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
             {/* API Key Input */}
             <div>
               <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">ElevenLabs API Key</label>
               <input type="password" id="apiKey" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your ElevenLabs key" className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition" aria-describedby="apiKey-warning"/>
               <p id="apiKey-warning" className="text-xs text-red-600 mt-1 pl-1">⚠️ Handled in your browser only.</p>
             </div>
             {/* Text Prompt Input */}
             <div>
               <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">Text Prompt</label>
               <textarea id="prompt" rows="4" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter text for the 'Adam' voice..." className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition"/>
             </div>
             {/* Image Input */}
             <div>
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
              <input type="file" id="imageFile" ref={imageInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-green-100 file:to-red-100 file:text-green-700 hover:file:opacity-90 transition file:cursor-pointer"/>
              {imageFile && <p className="text-xs text-gray-600 mt-1 pl-1">Selected: {imageFile.name}</p>}
             </div>
             {/* Submit Button */}
             <button type="submit" disabled={isLoading} className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-red-700 hover:from-green-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'} transition duration-150 ease-in-out`}>
               {isLoading ? 'Generating...' : 'Generate!'}
             </button>
          </form>
        </div>

        {/* Output/Progress Column - No changes needed here */}
        <div className="space-y-6">
           <ProgressDisplay steps={progressSteps} />

           {rawAudioUrl && (
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                 <h3 className="text-lg font-semibold mb-2 text-gray-700">Raw Audio Preview</h3>
                 <audio controls src={rawAudioUrl} className="w-full"> Your browser does not support the audio element. </audio>
              </div>
           )}

           {finalVideoUrl && (
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Your Video is Ready!</h3>
                   <a href={finalVideoUrl} download={`italian_brainrot_${Date.now()}.mp4`} target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition duration-150 ease-in-out"> Download Video </a>
              </div>
           )}

           {/* General Error Display */}
           {error && !isLoading && (
             <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow">
               <p className="font-bold">An Error Occurred:</p>
               <p>{error}</p>
             </div>
           )}
         </div>

      </div> {/* End Grid */}
    </div> // End Container
  );
}

export default HomePage;