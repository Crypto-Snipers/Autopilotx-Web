import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { X, Loader2, BadgeInfo, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { setSessionItem } from '@/lib/sessionStorageUtils';
import { Portal } from './ui/Portal';

// Prevent body scroll when modal is open
const usePreventBodyScroll = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);
};

interface AddBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddBrokerModalCoinDcx: React.FC<AddBrokerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [brokerId, setBrokerId] = useState('');
  const [app_name, setAppName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'inr' | 'usd' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const { toast } = useToast();
  const { user, hasCustomAuth } = useAuth();
  const [location, navigate] = useLocation();
  const [brokerIdError, setBrokerIdError] = useState('');

  usePreventBodyScroll(isOpen);

  if (!isOpen) return null;

  // First 2 characters should be alphabets and the rest should be numbers (10-15 chars total)
  const isValidateBrokerId = (id: string) => /^[A-Za-z]{2}\d{8,13}$/.test(id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brokerId) {
      setBrokerIdError('User Id required');
      return;
    } else if (!isValidateBrokerId(brokerId)) {
      setBrokerIdError('User ID must start with 2 letters followed by numbers');
      return;
    } else {
      setBrokerIdError('');
    }

    if (!brokerId || !apiKey || !apiSecret) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Step 1: Add broker
      const brokerData = {
        broker_id: brokerId,
        app_name: app_name,
        api_key: apiKey,
        api_secret: apiSecret,
        email: user?.email || '',
        broker_name: "coindcx",
        currency: selectedCurrency,
      };

      console.log("Sending broker data:", brokerData);
      // Define the expected response type
      interface VerifyResponse {
        success?: boolean;
        message?: string;
        [key: string]: any;
      }

      try {
        const verifyResponse: VerifyResponse = await apiRequest("POST", "/api/broker/verify", {
          email: user?.email || '',
          broker_name: "coindcx",
          broker_id: brokerId,
          app_name: app_name,
          api_key: apiKey,
          api_secret: apiSecret,
          currency: selectedCurrency,

        });

        if (verifyResponse?.success) {
          toast({
            title: "Success",
            description: "Broker connected successfully",
          });


          // Store broker info in localStorage/sessionStorage for immediate access
          setSessionItem("broker_name", "CoinDCX");
          setSessionItem("api_verified", "");
          setSessionItem("broker_id", brokerId || "");
          setSessionItem("currency", selectedCurrency || "");

          // Close modal and call success callback
          onClose();
          if (onSuccess) onSuccess();
          window.location.reload();

          // Use navigation instead of page reload to reflect changes
          // This avoids the full page reload that's causing authentication issues
          setTimeout(() => {
            // Navigate to the same page to trigger a re-render without full reload
            const currentPath = location;
            navigate(currentPath);
          }, 500);
        } else {
          toast({
            title: "Warning",
            description: verifyResponse?.message || "Broker added but verification pending",
          });
        }
      } catch (error) {
        console.error("Error adding broker:", error);
        toast({
          title: "Error",
          description: "An error occurred while connecting the broker",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/50 flex justify-center items-start pt-16 pb-8 overflow-y-auto"
        onClick={(e) => {
          // Close modal when clicking on the overlay
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-background rounded-2xl shadow-2xl w-[800px] max-h-[80vh] overflow-y-auto transition-all duration-300 dark:border dark:border-green-500/20 dark:shadow-2xl dark:shadow-green-400/20 transform scale-100">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-800 dark:text-white">Add Broker</h2>
            <div className="flex items-center gap-4">
              <a
                href="https://docs.coindcx.com/#terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#06a57f] text-sm hover:underline"
              >
                View Docs
              </a>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={onClose}
                disabled={isLoading}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Broker selection pill */}
          <div className="p-4 flex items-center justify-between bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#05b289] via-[#06a07c] to-[#047158] bg-opacity-20">
            <div className="flex items-center space-x-2">
              <img
                src="https://coindcx.com/blog/wp-content/uploads/2021/09/ProfilePic.svg"
                alt="CoinDCX Logo"
                className="h-6 w-6"
              />
              <span className="text-base font-semibold text-gray-200">CoinDCX</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-gray-200">How to add CoinDCX?</span>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
                title="Watch tutorial"
              >
                <BadgeInfo className="h-5 w-5 text-green-400" />
              </a>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-2 gap-6 p-6 relative">
            {/* Vertical divider */}
            <div className="absolute left-1/2 top-6 bottom-6 w-px bg-gray-200 transform -translate-x-1/2"></div>

            {/* Left column: Instructions */}
            <div className="text-sm text-gray-700 dark:text-gray-200 space-y-3">

              <div className='flex gap-1'>
                <p>1.</p>
                <div>
                  <span className='text-md'>Go to : </span>
                  <a
                    href="https://coindcx.com/api/"
                    className="text-[#06a57f] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://coindcx.com
                  </a>
                  <span className='text-md ml-1'>and log in with your registered email and password.</span>
                </div>
              </div>

              <div className='flex gap-1 py-2'>
                <p>2.</p>
                <p>⁠Click on your Profile Icon → API Management (usually found in the top-right corner of the dashboard)</p>
              </div>

              {/* <div className='flex gap-1 py-2'>
              <p>3.</p>
              <div>
                <span>Copy and paste the whitelisted IP below:</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value="13.232.102.237"
                    readOnly
                    className="w-full p-2 border dark:border-gray-400 dark:bg-background dark:text-gray-400 rounded-lg bg-gray-100 text-gray-700 text-sm"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 text-xs rounded-lg font-medium bg-[#02b589] hover:bg-[#00a67d] text-white transition"
                    onClick={() => {
                      navigator.clipboard.writeText("13.232.102.237")
                      toast({
                        title: "Successful",
                        description: "Text copied!",
                      });
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div> */}

              <div className='flex gap-1 py-2'>
                <p>3.</p>
                <p>⁠Click “Create API” and set the permissions you need (like Read, Trade, or Withdraw).</p>
              </div>
              <div className='flex gap-1 py-2'>
                <p>4.</p>
                <p>⁠Verify the action via OTP or 2FA, and your API Key and Secret Key will be generated.</p>
              </div>
              <div className='flex gap-1 py-2'>
                <p>5.</p>
                <p>⁠Paste the API Key and API Secret Key in provided boxes on the right.</p>
              </div>
            </div>

            {/* Right column */}
            {/* Form */}
            <form onSubmit={handleSubmit} className="px-4">
              <div className="mb-4">
                <label className="text-sm text-gray-600 dark:text-gray-200 mt-2 mb-2 block">
                  User Id <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="AB123456"
                  value={brokerId}
                  minLength={10}
                  maxLength={15}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBrokerId(value);
                    if (value) {
                      if (value.length < 10) {
                        setBrokerIdError('User ID must be at least 10 characters');
                      } else if (value.length > 15) {
                        setBrokerIdError('User ID cannot exceed 15 characters');
                      } else if (!isValidateBrokerId(value)) {
                        setBrokerIdError('User ID must start with 2 letters followed by numbers');
                      } else {
                        setBrokerIdError('');
                      }
                    } else {
                      setBrokerIdError('');
                    }
                  }}
                  disabled={isLoading}
                  className={`w-full p-3 border dark:border-gray-400 dark:bg-background dark:text-gray-400 rounded-lg focus:outline-none focus:ring-2 text-sm ${brokerIdError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:ring-green-500'
                    }`}
                />
                {brokerIdError && (
                  <p className="text-red-500 text-sm mt-1">{brokerIdError}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-600 dark:text-gray-200 mb-2 block">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm dark:border-gray-400 dark:bg-background dark:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-600 dark:text-gray-200 mb-2 block">API Secret Key</label>
                <div className="relative">
                  <input
                    type={showApiSecret ? "text" : "password"}
                    placeholder="Enter your API Secret Key"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    onClick={() => setShowApiSecret(!showApiSecret)}
                    disabled={isLoading}
                    className="w-full p-3 pr-10 border border-gray-200 dark:border-gray-400 dark:bg-background dark:text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiSecret(!showApiSecret)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Currency Selection */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 dark:text-gray-200 mb-2 block">Select Currency</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCurrency === 'inr'}
                      onChange={() => setSelectedCurrency('inr')}
                      disabled={isLoading}
                    />
                    <span>INR</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCurrency === 'usd'}
                      onChange={() => setSelectedCurrency('usd')}
                      disabled={isLoading}
                    />
                    <span>USDT</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pb-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  // disabled={isLoading || !brokerId}
                  className="w-full bg-[#02b589] dark:bg-gray-600 dark:hover:bg-gray-800 hover:bg-[#01a97f] text-white font-semibold py-3 rounded-lg text-sm transition cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex justify-center items-center">
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Connecting...
                    </span>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div >
    </Portal>
  );
};

export default AddBrokerModalCoinDcx;