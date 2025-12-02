import CongratulationPopup from "@/assets/congratulation_popup.svg"

interface CongratulationsPopupProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export default function CongratulationsPopup({ isOpen, onClose, message = 'deployed' }: CongratulationsPopupProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-8 pb-4">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white text-left">Congratulations!</h1>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 mx-8"></div>

                {/* Content */}
                <div className="px-8 py-8 text-center">
                    {/* Illustration */}
                    <div className="mb-8 flex justify-center">
                        <div className="w-48 h-32 relative">
                            <img src={CongratulationPopup} className="w-full h-full object-contain" alt="Congratulation Popup" />
                        </div>
                    </div>

                    {/* Message */}
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8">
                        Hey! We have successfully {message} the strategy.
                    </p>
                </div>

                {/* Button */}
                <div className="px-8 pb-8">
                    <button
                        className="w-full bg-[#06a57f] hover:bg-[#06a57f]/80 text-white font-medium py-4 rounded-full text-lg h-auto"
                        onClick={onClose}
                    >
                        Okay
                    </button>
                </div>
            </div>
        </div>
    )
}