import React from 'react';

const IconPending = () => <span className="text-gray-400">⏳</span>;
const IconInProgress = () => <span className="animate-spin text-blue-500">⚙️</span>;
const IconSuccess = () => <span className="text-green-500">✅</span>;
const IconError = () => <span className="text-red-500">❌</span>;

const statusIcons = {
  pending: <IconPending />,
  inprogress: <IconInProgress />,
  success: <IconSuccess />,
  error: <IconError />,
};

function ProgressDisplay({ steps }) {
  // Steps should be an object like:
  // { id: 'validate', label: 'Validating Input', status: 'pending' | 'inprogress' | 'success' | 'error', message: 'Optional message' }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Generation Progress</h3>
      {steps.map((step) => (
        <div key={step.id} className={`flex items-center p-2 rounded-md transition-colors duration-200 ${step.status === 'inprogress' ? 'bg-blue-50' : ''}`}>
          <span className="text-xl mr-3 w-6 text-center">{statusIcons[step.status] || <IconPending />}</span>
          <div className="flex-grow">
             <p className={`font-medium ${
                step.status === 'error' ? 'text-red-600' :
                step.status === 'success' ? 'text-green-600' :
                step.status === 'inprogress' ? 'text-blue-600' :
                'text-gray-600'
             }`}>
                {step.label}
             </p>
             {step.message && <p className="text-xs text-gray-500 mt-1">{step.message}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProgressDisplay;
