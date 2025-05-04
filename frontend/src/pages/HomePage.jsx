import React, { useState, useRef, useCallback } from 'react';
import ProgressDisplay from '../components/ProgressDisplay';
import { callElevenLabs, uploadForVideo } from '../services/elevenlabs';

const initialProgressSteps = [
  { id: 'validate', label: 'Validating Input', status: 'pending', message: '' },
  { id: 'elevenlabs', label: 'Calling ElevenLabs API', status: 'pending', message: '' },
  { id: 'upload', label: 'Uploading Files to Server', status: 'pending', message: '' },
  { id: 'processing', label: 'Server Processing Video', status: 'pending', message: 'This may take a moment...' },
  { id: 'complete', label: 'Complete', status: 'pending', message: '' },
];

function HomePage() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [progressSteps, setProgressSteps] = useState(initialProgressSteps);
  const [isLoading, setIsLoading] = useState(false);
  const [rawAudioUrl, setRawAudioUrl] = useState(null);
  const [generatedAudioBlob, setGeneratedAudioBlob] = useState(null); // Store the blob for upload
  const [finalVideoUrl, setFinalVideoUrl] = useState(null);
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
    }
  }, []);

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
    setGeneratedAudioBlob(null);
    setFinalVideoUrl(null);
    setProgressSteps(initialProgressSteps);

    // Revoke previous blob URL if it exists
    if (currentAudioUrl.current) {
        URL.revokeObjectURL(currentAudioUrl.current);
        currentAudioUrl.current = null;
    }

    updateStepStatus('validate', 'inprogress');
    let validationPassed = true;
    if (!apiKey) { updateStepStatus('validate', 'error', 'API Key required.'); validationPassed = false; }
    if (!prompt) { updateStepStatus('validate', 'error', 'Text prompt required.'); validationPassed = false; }
    if (!imageFile) { updateStepStatus('validate', 'error', 'Image file required.'); validationPassed = false; }

    if (!validationPassed) {
      setIsLoading(false);
      return;
    }
    updateStepStatus('validate', 'success');

    let audioBlob = null; // Keep track of the blob outside try block

    try {
      updateStepStatus('elevenlabs', 'inprogress');
      audioBlob = await callElevenLabs(apiKey, prompt);
      const objectUrl = URL.createObjectURL(audioBlob);
      currentAudioUrl.current = objectUrl; // Store to revoke later
      setRawAudioUrl(objectUrl);
      setGeneratedAudioBlob(audioBlob); // Store blob for upload
      updateStepStatus('elevenlabs', 'success');

      updateStepStatus('upload', 'inprogress');
      // Pass the *stored* audioBlob, not the URL
      const uploadResponse = await uploadForVideo(audioBlob, imageFile);
      updateStepStatus('upload', 'success');

      // Server processing might take time; backend could ideally use WebSockets
      // or polling. For now, we assume the backend waits and responds.
      // If backend responds immediately with job ID, this part needs rework.
      updateStepStatus('processing', 'inprogress', 'Waiting for server response...');

      // Assuming backend response contains the final URL after processing
      if (!uploadResponse || !uploadResponse.videoUrl) {
          throw new Error("Backend did not return a valid video URL.");
      }
      setFinalVideoUrl(uploadResponse.videoUrl);
      updateStepStatus('processing', 'success');
      updateStepStatus('complete', 'success', 'Video generated successfully!');

    } catch (err) {
      console.error("Generation process failed:", err);
      const currentStep = progressSteps.find(step => step.status === 'inprogress');
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error', err.message);
      } else {
        // If error happened during validation or very early
        setError(err.message || 'An unknown error occurred.');
        updateStepStatus('validate', 'error', err.message);
      }
      updateStepStatus('complete', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <div className="container mx-auto">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

         {/* Input Column */}
         <div className="bg-gradient-to-br from-green-50 via-white to-red-50 p-6 md:p-8 shadow-lg rounded-lg border border-gray-200">
           <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-700">
						Create your Italian Brainrot Video
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

         {/* Output/Progress Column */}
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
                    <a href={finalVideoUrl} download="italian_brainrot_video.mp4" target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition duration-150 ease-in-out"> Download Video </a>
               </div>
            )}

            {error && !isLoading && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow">
                <p className="font-bold">An Error Occurred:</p>
                <p>{error}</p>
              </div>
            )}
          </div>

       </div>
     </div>
   );
}

export default HomePage;
