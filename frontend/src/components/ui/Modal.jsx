import { X } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const Modal = ({ isOpen, onClose, title, children }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 p-0 animate-fade-in sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white shadow-xl sm:max-w-md sm:rounded-lg">
        <div className="flex items-center justify-between gap-4 border-b p-4">
          <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">{title}</h2>
          <button 
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
            aria-label={t('common_close')}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
