import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../ui/Button';

export const PAGE_SIZE = 7;

const PaginationControls = ({ page, totalItems, pageSize = PAGE_SIZE, onPageChange, label }) => {
  const { t } = useLanguage();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const itemLabel = label || t('common_items');

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-sm text-gray-500">
        {t('common_page_x_of_y', { page: currentPage, totalPages })} · {totalItems} {itemLabel}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button size="sm" variant="outline" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
          <ChevronsLeft size={16} className="mr-1" />
          {t('common_first')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
          <ChevronLeft size={16} className="mr-1" />
          {t('common_previous')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
          {t('common_next')}
          <ChevronRight size={16} className="ml-1" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
          {t('common_last')}
          <ChevronsRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
