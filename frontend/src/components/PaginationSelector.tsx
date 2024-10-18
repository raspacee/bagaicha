import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

type Props = {
  onPageChange: (page: number) => void;
  currentPage: number;
  pages: number;
};

const PaginationSelector = ({ currentPage, onPageChange, pages }: Props) => {
  const pageNumbers = [];
  for (let i = 1; i <= pages; i++) {
    pageNumbers.push(i);
  }

  const MaxPagesShown = 6 / 2; // Halfed at left and right side
  const leftIndex =
    currentPage - MaxPagesShown < 0 ? 0 : currentPage - MaxPagesShown;
  const rightIndex = currentPage + MaxPagesShown;

  return (
    <Pagination>
      <PaginationContent>
        {currentPage !== 1 && (
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => onPageChange(currentPage - 1)}
            />
          </PaginationItem>
        )}
        {pageNumbers.slice(leftIndex, rightIndex).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={page == currentPage}
              href="#"
              onClick={() => onPageChange(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {currentPage !== pageNumbers.length && (
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => onPageChange(currentPage + 1)}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationSelector;
