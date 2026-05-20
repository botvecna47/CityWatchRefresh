import { Button } from "./ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const PaginationControls = ({ currentPage, totalPages, onPageChange, className = "" }: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-4 py-4 ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 0}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" /> Previous 10
      </Button>
      
      <span className="text-sm font-medium text-gray-500">
        Page {currentPage + 1} of {totalPages}
      </span>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage >= totalPages - 1}
        className="flex items-center gap-1"
      >
        Next 10 <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
