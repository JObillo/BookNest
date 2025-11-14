import React from "react";
import { FineRecord } from "./FineList";

type ReceiptPrintProps = {
  record: FineRecord;
  formatDateTime: (dateString?: string) => string;
};

// ✅ Removed window.print() and window.close()
const ReceiptPrint: React.FC<ReceiptPrintProps> = ({ record, formatDateTime }) => {
  return (
    <div
    id="receipt-print" 
     className="p-4 text-sm text-black w-[80mm] mx-auto">
      <h2 className="text-center font-bold text-lg mb-2">Library Fine Receipt</h2>
      <div className="border-t border-dashed border-black my-2"></div>

      <div className="mb-2">
        <p><span className="font-semibold">Borrower:</span> {record.patron.name}</p>
        <p><span className="font-semibold">School ID:</span> {record.patron.school_id}</p>
        <p><span className="font-semibold">Patron Type:</span> {record.patron.patron_type}</p>
      </div>

      <div className="mb-2">
        <p><span className="font-semibold">Book Title:</span> {record.book.title}</p>
        <p><span className="font-semibold">ISBN:</span> {record.book.isbn}</p>
      </div>

      <div className="mb-2">
        <p><span className="font-semibold">Due Date:</span> {formatDateTime(record.due_date)}</p>
        <p><span className="font-semibold">Returned:</span> {formatDateTime(record.returned_date)}</p>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      <div className="text-center mb-2">
        <p><span className="font-semibold">Fine Amount:</span> ₱{Number(record.fine_amount ?? 0).toFixed(2)}</p>
        <p><span className="font-semibold">Status:</span> {record.fine_status}</p>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      <p className="text-center italic">Thank you! Keep this receipt for your record.</p>
    </div>
  );
};

export default ReceiptPrint;
