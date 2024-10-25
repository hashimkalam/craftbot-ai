"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTable, usePagination } from "react-table";
import { Button } from "../ui/button";
import { ExternalLink } from "lucide-react";
import Loading from "@/app/dashboard/loading"; // Import the Loading component

const ChatSessionTable = ({ filteredSessions }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // useTransition for managing loading state
  const [pendingRowId, setPendingRowId] = useState(null); // Track the row that is currently loading

  // Define columns for the table
  const columns = React.useMemo(
    () => [
      {
        Header: "Guest Name",
        accessor: "guests.name", // Accessing nested properties
      },
      {
        Header: "Email",
        accessor: "guests.email",
        Cell: ({ value }) => value || "No email provided", // Handling empty email
      },
      {
        Header: "Actions",
        accessor: "id",
        Cell: ({ value }) => (
          <Button
            className="bg-gray-100 dark:bg-primary/20 hover:bg-gray-300 text-black dark:text-white cursor-pointer m-1"
            onClick={() => {
              setPendingRowId(value);
              startTransition(() => {
                router.push(`/dashboard/review-sessions/${value}`);
              });
            }}
            disabled={pendingRowId === value} // Disable button for the pending row
          >
            {pendingRowId === value ? (
              <Loading className="w-4 h-4" />
            ) : (
              <ExternalLink size={18} className="-m-1" />
            )}
          </Button>
        ),
      },
    ],
    [router, pendingRowId]
  );

  // Create table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page, // Use 'page' instead of 'rows' to display only the current page
    prepareRow,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: filteredSessions,
      initialState: { pageIndex: 0 },
    },
    usePagination
  );

  return (
    <div className="space-y-5 p-5 w-full rounded-md">
      <div className="overflow-x-auto">
        <table
          {...getTableProps()}
          className="w-full bg-white dark:bg-primary/20 border border-gray-200"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    key={column.id}
                    {...column.getHeaderProps()}
                    className="px-2 sm:px-4 py-2 border-b text-left text-gray-600 dark:text-white dark:bg-primary-DARK/50"
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr
                  key={row.id}
                  {...row.getRowProps()}
                  className="hover:bg-gray-50"
                >
                  {row.cells.map((cell) => (
                    <td
                      key={cell.id}
                      {...cell.getCellProps()}
                      className="px-2 sm:px-4 py-2 border-b text-sm sm:text-base"
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center py-4">
        <div>
          <span>
            Page{" "}
            <strong>
              {pageIndex + 1} of {Math.ceil(filteredSessions.length / pageSize)}
            </strong>
          </span>
        </div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <button
            className="bg-gray-300 text-black px-2 py-1 rounded"
            onClick={() => gotoPage(0)} // Go to first page
            disabled={!canPreviousPage}
          >
            {"<<"}
          </button>
          <button
            className="bg-gray-300 text-black px-2 py-1 rounded"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            {"<"}
          </button>
          <button
            className="bg-gray-300 text-black px-2 py-1 rounded"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            {">"}
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-500 text-black px-2 py-1 rounded"
            onClick={() =>
              gotoPage(Math.ceil(filteredSessions.length / pageSize) - 1)
            } // Go to last page
            disabled={!canNextPage}
          >
            {">>"}
          </button>
        </div>
        <div className="mt-2 sm:mt-0">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
            className="border border-gray-300 rounded"
          >
            {[5, 10, 15, 20].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ChatSessionTable;
