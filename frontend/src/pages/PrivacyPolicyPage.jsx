import React from 'react';

const githubUrl = "https://github.com/sanmatte/italian-brainrot-generator";

function PrivacyPolicyPage() {
  return (
    <div className="bg-white p-6 md:p-8 shadow-xl rounded-xl border border-gray-200 max-w-3xl mx-auto text-gray-700 text-base leading-relaxed">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
        House Rules (Privacy Policy)
      </h1>
      <p className="mb-6 text-sm italic">
        // Basically, it's chill.
      </p>

      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mt-6 mb-2">What Happens With Your Stuff? (Not Much)</h2>
      <p className="mb-4">
        This app does one thing: takes text, an image, and an API key (yours!), mixes them with music, and makes a "brainrot" video. Here’s what we use:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1 pl-4 text-sm">
        <li><strong className="font-medium">Your ElevenLabs API Key:</strong> You put this into the browser yourself. <strong className="text-red-600">IMPORTANT:</strong> This key is sent by YOUR browser DIRECTLY to ElevenLabs to create the audio. **It NEVER reaches our server.** We don't see it, save it, or anything. Check ElevenLabs' own privacy policy for what they do.</li>
        <li><strong className="font-medium">The Text (Prompt):</strong> Like the key, this goes straight from your browser to ElevenLabs.</li>
        <li><strong className="font-medium">The Image & Generated Audio:</strong> After ElevenLabs gives the audio back to your browser, your browser sends the image you uploaded and that audio file to OUR server.</li>
        <li><strong className="font-medium">The Background Music:</strong> We use a fixed file (`music.mp3`) already on our server.</li>
      </ul>

      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mt-6 mb-2">How We Use Your Stuff (Just For The Video)</h2>
      <p className="mb-4 text-sm">
        The image and audio that reach our server are ONLY used to create the final video, mixing them with the music. We don't do anything else. The server uses tools like FFmpeg/MoviePy to do this magic, and that's it. Standard server logs (IP, times) are kept briefly for security, like everywhere else.
      </p>

      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mt-6 mb-2">How Long's the Party? (Temporary Storage)</h2>
      <p className="mb-4 text-sm">
        We're lazy, we don't want to keep useless data:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1 pl-4 text-sm">
        <li>API Key: Never had it, never kept it.</li>
        <li>Uploaded Image & Generated Audio: Deleted shortly after the video is made (a few hours max).</li>
        <li>Final Video: Stays just long enough for you to download it (max 24 hours, usually less), then poof! Deleted.</li>
      </ul>

      {/* Open Source Section */}
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mt-6 mb-2">The Code is Open! (Open Source)</h2>
      <p className="mb-4 text-sm">
        This project is completely open source. That means you can check out the code yourself to see exactly how it works and how data is handled (and maybe make it better!). No hidden tricks. You can find it all here:
        <br />
        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
          {githubUrl}
        </a>
      </p>

      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mt-6 mb-2">Other Important Things (Quickly!)</h2>
      <ul className="list-disc list-inside mb-4 space-y-1 pl-4 text-sm">
        <li><strong className="font-medium">Security:</strong> We try to do things right, but the internet is weird, 100% security doesn't exist.</li>
        <li><strong className="font-medium">Cookies:</strong> We don't use 'em, don't like 'em.</li>
        <li><strong className="font-medium">Kids:</strong> If you're under 16, you probably shouldn't use this. We don't knowingly collect kids' data.</li>
        <li><strong className="font-medium">Changes:</strong> If we change these rules, we'll update this page. Check back sometimes.</li>
        <li><strong className="font-medium">Contact:</strong> Questions? Existential doubts? Email us at [Insert Placeholder Email Here, e.g., contact@brainrot.generator.xyz (Not real)].</li>
      </ul>

    </div>
  );
}

export default PrivacyPolicyPage;
