import React from 'react';
import { Link } from 'react-router-dom';

function HowToPage() {
  const githubUrl = "https://github.com/sanmatte/italian-brainrot-generator";

  return (
    <div className="bg-gray-900/80 backdrop-blur-md p-6 md:p-8 shadow-xl rounded-xl border border-gray-700/50 max-w-3xl mx-auto text-gray-300 text-base leading-relaxed">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 pb-2 border-b border-gray-600/50">
        How To Use This Thingamajig
      </h1>

      <h2 className="text-lg md:text-xl font-semibold text-white mt-6 mb-3">What It Does</h2>
      <p className="mb-4 text-sm text-gray-400">
        This tool lets you create short "Italian Brainrot" style videos. You provide some text (in Italian!), an image, and an ElevenLabs API key. The tool uses the ElevenLabs AI voice ('Adam') to generate audio, mixes it with background music, puts it over your image, and gives you a video file.
      </p>

      <h2 className="text-lg md:text-xl font-semibold text-white mt-6 mb-3">Steps to Generate Brainrot:</h2>
      <ol className="list-decimal list-inside mb-4 space-y-2 pl-4 text-sm text-gray-300">
        <li>
          <strong className="font-medium text-gray-200">Get an ElevenLabs API Key:</strong> See below if you need one.
        </li>
        <li>
          <strong className="font-medium text-gray-200">Go to the <Link to="/" className="text-cyan-400 hover:text-cyan-300 underline">Generate</Link> page.</strong>
        </li>
        <li>
          <strong className="font-medium text-gray-200">Enter API Key:</strong> Paste your key in the input. <br />Remember: it's sent <strong className="text-red-400">directly to ElevenLabs from your browser</strong>, never to our server. Keep it safe!
        </li>
        <li>
          <strong className="font-medium text-gray-200">Enter Prompt:</strong> Type the Italian text for the voice.
        </li>
        <li>
          <strong className="font-medium text-gray-200">Upload Image:</strong> Select a background image (JPG, PNG, WEBP).
        </li>
        <li>
          <strong className="font-medium text-gray-200">Click Generate:</strong> Hit the button and wait, you can see the progresses to the right of the screen.
        </li>
        <li>
          <strong className="font-medium text-gray-200">(Optional) Preview Audio:</strong> An audio player appears once ElevenLabs finishes. 
        </li>
        <li>
          <strong className="font-medium text-gray-200">Download Video:</strong> When complete, the download button appears. Grab your MP4! (Background music is added automatically).
        </li>
      </ol>

      <h2 className="text-lg md:text-xl font-semibold text-white mt-8 mb-3 pt-4 border-t border-gray-600/50">How to Get an ElevenLabs API Key</h2>
      <p className="mb-2 text-sm text-gray-400">
        ElevenLabs provides the 'Adam' AI voice. You need a personal API key from them.
      </p>
      <ol className="list-decimal list-inside mb-4 space-y-2 pl-4 text-sm text-gray-300">
        <li>
          <strong className="font-medium text-gray-200">Go to ElevenLabs:</strong> Visit <a href="https://elevenlabs.io/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">elevenlabs.io</a>.
        </li>
        <li>
          <strong className="font-medium text-gray-200">Sign Up / Log In:</strong> Create or log into your account. Check their free tier limits & pricing.
        </li>
        <li>
          <strong className="font-medium text-gray-200">Find API Key:</strong> Go to <Link to="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">API Keys</Link> in your account settings.
        </li>
        <li>
          <strong className="font-medium text-gray-200">Copy the Key:</strong> Securely copy your unique API key string.
        </li>
        <li>
          <strong className="font-medium text-gray-200">Paste Here:</strong> Put the key in the "API Key" field on the <Link to="/" className="text-cyan-400 hover:text-cyan-300 underline">Generate</Link> page.
        </li>
      </ol>
      <p className="text-xs text-gray-500 italic">
        Guard your API key like a secret! This app only uses it in your browser.
      </p>

      <h2 className="text-lg md:text-xl font-semibold text-white mt-6 mb-2 pt-4 border-t border-gray-600/50">Contact</h2>
       <p className="mb-4 text-sm">
		If you have any question, feel free to open an issue at <Link to={githubUrl} className="text-cyan-400 hover:text-cyan-300 underline">{githubUrl}</Link>.
       </p>

    </div>
  );
}

export default HowToPage;
