"use client";

import React, { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}
function Table({ children, className = "" }: TableProps) {
  return (
    <table className={`min-w-full border-collapse ${className}`}>
      {children}
    </table>
  );
}

// Table sub-components
function HeaderRow({ children, className = "" }: { children: ReactNode; className?: string; }) {
  return <thead className={className}><tr>{children}</tr></thead>;
}
function Row({ children, className = "" }: { children: ReactNode; className?: string; }) {
  return <tr className={className}>{children}</tr>;
}
function HeaderCell({ children, className = "" }: { children: ReactNode; className?: string; }) {
  return (
    <th
      scope="col"
      className={`text-left text-sm font-semibold text-neutral-700 px-4 py-2 border-b border-neutral-border ${className}`}
    >
      {children}
    </th>
  );
}
function Cell({ children, className = "" }: { children: ReactNode; className?: string; }) {
  return (
    <td className={`text-sm text-neutral-800 px-4 py-2 border-b border-neutral-border ${className}`}>
      {children}
    </td>
  );
}
// Attach
Table.HeaderRow = HeaderRow;
Table.Row = Row;
Table.HeaderCell = HeaderCell;
Table.Cell = Cell;

export { Table };
export default Table;

// "use client";

// import React, { ReactNode } from "react";

// interface TableProps {
//   children: ReactNode;
//   className?: string;
// }

// interface TableRowProps {
//   children: ReactNode;
//   className?: string;
// }

// interface TableCellProps {
//   children: ReactNode;
//   className?: string;
// }

// /**
//  * Table root
//  */
// export function Table({ children, className = "" }: TableProps) {
//   return (
//     <table className={`min-w-full border-collapse ${className}`}>
//       {children}
//     </table>
//   );
// }

// /**
//  * Table header row
//  */
// export function TableHeaderRow({ children, className = "" }: TableRowProps) {
//   return <thead className={className}><tr>{children}</tr></thead>;
// }

// /**
//  * Table row
//  */
// export function TableRow({ children, className = "" }: TableRowProps) {
//   return <tr className={className}>{children}</tr>;
// }

// /**
//  * Table header cell
//  */
// export function TableHeaderCell({ children, className = "" }: TableCellProps) {
//   return (
//     <th
//       scope="col"
//       className={`text-left text-sm font-semibold text-neutral-700 px-4 py-2 border-b border-neutral-border ${className}`}
//     >
//       {children}
//     </th>
//   );
// }

// /**
//  * Table cell
//  */
// export function TableCell({ children, className = "" }: TableCellProps) {
//   return (
//     <td className={`text-sm text-neutral-800 px-4 py-2 border-b border-neutral-border ${className}`}>
//       {children}
//     </td>
//   );
// }

// /**
//  * Attach sub components
//  */
// Table.HeaderRow = TableHeaderRow;
// Table.Row = TableRow;
// Table.HeaderCell = TableHeaderCell;
// Table.Cell = TableCell;
