// src/components/CurrentActionDisplay.jsx
import React from 'react';

// Minimal indicators
const LoadingIndicator = () => <span className="mx-1 font-bold text-sm">...</span>;
const SuccessIndicator = () => <span className="text-[var(--c-accent1)] mx-1 font-bold">✓</span>;
// Use jarring color for error indicator
const ErrorIndicator = () => <span className="text-[var(--c-accent-jarring)] mx-1 font-bold">!!!</span>;

function CurrentActionDisplay({ message = "SYSTEM NOMINAL", status = "pending" }) {
  const isWorking = status === 'inprogress';
  const isError = status === 'error';
  const isSuccess = status === 'success';

  let textColor = "text-gray-500"; // Pending
  // Use base text color for working/success
  if (isWorking) textColor = "text-[var(--c-text)]";
  if (isSuccess) textColor = "text-[var(--c-text)]";
  // Use jarring color for error text
  if (isError) textColor = "text-[var(--c-accent-jarring)] font-bold";

  return (
    // Clean container, minimal border
    <div className="w-full bg-[var(--c-paper)] border border-[var(--c-border)] p-4 my-6 rounded-lg text-center shadow-sm">
      <div className={`text-lg ${textColor} uppercase tracking-wider transition-colors duration-200`}>
        {/* Show indicator first maybe? */}
        {isWorking && <LoadingIndicator />}
        {isSuccess && <SuccessIndicator />}
        {isError && <ErrorIndicator />}
        <span className="ml-2">{message}</span>
      </div>
    </div>
  );
}

export default CurrentActionDisplay;
