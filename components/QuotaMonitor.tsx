
import React from 'react';

interface QuotaMonitorProps {
  onClose: () => void;
}

const QuotaMonitor: React.FC<QuotaMonitorProps> = ({ onClose }) => {
  // Real-world defaults for a standard Pay-as-you-go GCP project
  const LIMITS = {
    image: { name: 'Gemini Flash Image', current: 60, required: 400, unit: 'RPM' },
    tts: { name: 'Gemini Flash TTS', current: 600, required: 350, unit: 'RPM' },
    text: { name: 'Gemini 3 Pro (Script)', current: 360, required: 50, unit: 'RPM' },
  };

  const calculateStatus = (current: number, required: number) => {
    const ratio = current / required;
    if (ratio < 0.5) return { color: 'bg-red-500', text: 'CRITICAL BOTTLENECK', action: 'Request 5x Increase' };
    if (ratio < 1.0) return { color: 'bg-yellow-500', text: 'AT CAPACITY', action: 'Request Increase' };
    return { color: 'bg-green-500', text: 'HEALTHY', action: 'No Action Needed' };
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border-2 border-zinc-900 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b-2 border-zinc-100 flex justify-between items-center bg-zinc-50">
          <div>
            <h2 className="text-2xl font-display font-bold text-zinc-900">Infrastructure Scalability Monitor</h2>
            <p className="text-sm text-zinc-500 font-mono mt-1">Target Load: 26,000 Monthly Active Users</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          
          {/* Analysis Section */}
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(LIMITS).map(([key, data]) => {
              const status = calculateStatus(data.current, data.required);
              return (
                <div key={key} className="border-2 border-zinc-200 rounded-lg p-5 flex flex-col relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${status.color}`}></div>
                  <h3 className="font-bold text-zinc-700 mb-4">{data.name}</h3>
                  
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-display font-bold">{data.current}</span>
                    <span className="text-xs font-mono text-zinc-400 mb-1">{data.unit} Limit</span>
                  </div>
                  
                  <div className="w-full bg-gray-100 h-2 rounded-full mb-4 overflow-hidden">
                     <div 
                        className={`h-full ${status.color}`} 
                        style={{ width: `${Math.min((data.current / data.required) * 100, 100)}%` }}
                     ></div>
                  </div>

                  <div className="text-xs font-mono text-zinc-500 mb-4">
                    Required Peak: <strong>{data.required} {data.unit}</strong>
                  </div>

                  <div className={`inline-flex items-center justify-center px-3 py-1 rounded text-xs font-bold text-white ${status.color}`}>
                    {status.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Plan */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
            <h3 className="text-blue-900 font-bold text-lg mb-2">🚀 Scaling Action Plan</h3>
            <p className="text-blue-800 text-sm mb-4 leading-relaxed">
              Based on your target of 25,000 free users and 1,000 paid users, your current <strong>Image Generation Quota (60 RPM)</strong> is the primary bottleneck. You will likely hit `429 Too Many Requests` errors during peak hours.
            </p>
            
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-xs mt-0.5">1</div>
                    <div>
                        <p className="text-sm font-bold text-blue-900">Access Google Cloud Quotas</p>
                        <p className="text-xs text-blue-700">Navigate to IAM & Admin &gt; Quotas & System Limits.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-xs mt-0.5">2</div>
                    <div>
                        <p className="text-sm font-bold text-blue-900">Filter for "Generative AI API"</p>
                        <p className="text-xs text-blue-700">Locate the region `us-central1` (or your primary region).</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-xs mt-0.5">3</div>
                    <div>
                        <p className="text-sm font-bold text-blue-900">Request Increase for `base_model_flash_image_requests_per_minute`</p>
                        <p className="text-xs text-blue-700">Set new limit to <strong>500</strong>. Reason: "Scaling production app to 26k users."</p>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <a 
                    href="https://console.cloud.google.com/iam-admin/quotas?service=generativelanguage.googleapis.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Open Google Cloud Quotas
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-400 font-mono">
            * Note: "Gemini 2.5 Pro" does not support TTS endpoints. We utilize "Gemini 2.5 Flash TTS" for optimal latency/cost.
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuotaMonitor;
