import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

/**
 * Reusable back button that navigates to the previous page in history.
 * If there is no history entry (e.g., the user landed directly on the page),
 * it falls back to a provided route (default: home page).
 */
export default function BackButton({ fallback = '/' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-[10px] font-black text-[var(--tl)] uppercase tracking-widest hover:text-[var(--p)] transition-colors"
    >
      <FiArrowLeft size={16} />
      Back
    </button>
  );
}
