import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    // Generate page numbers to show (e.g., 1, 2, 3, 4, 5)
    // For a large number of pages, we use a moving window centered around currentPage
    const getPageNumbers = () => {
        const pages = [];
        const maxShown = 5; // max number buttons to show at once

        let startPage = Math.max(1, currentPage - Math.floor(maxShown / 2));
        let endPage = startPage + maxShown - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxShown + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    const pages = getPageNumbers();

    return (
        <div className="pagination-wrapper">
            <button
                className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={handlePrev}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={20} />
            </button>

            <div className="pagination-numbers">
                {pages[0] > 1 && (
                    <>
                        <button className="pagination-number" onClick={() => onPageChange(1)}>1</button>
                        {pages[0] > 2 && <span className="pagination-ellipsis">...</span>}
                    </>
                )}

                {pages.map(pageNum => (
                    <button
                        key={pageNum}
                        className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => onPageChange(pageNum)}
                    >
                        {pageNum}
                    </button>
                ))}

                {pages[pages.length - 1] < totalPages && (
                    <>
                        {pages[pages.length - 1] < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                        <button className="pagination-number" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                    </>
                )}
            </div>

            <button
                className={`pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={handleNext}
                disabled={currentPage === totalPages}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}

export default Pagination;
