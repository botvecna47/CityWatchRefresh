import React, { useState } from "react";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { Button, Textarea } from "../../components/ui";

interface DeleteReportModalProps {
  onClose: () => void;
  onConfirm: (messageForCitizen: string, reason: string) => void;
}

export const DeleteReportModal = React.forwardRef<HTMLDivElement, DeleteReportModalProps>(
  ({ onClose, onConfirm }, ref) => {
    const [messageForCitizen, setMessageForCitizen] = useState("");
    const [reason, setReason] = useState("");

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl relative text-[#1A4331]"
        >
          <h3 className="text-xl font-bold mb-2 font-serif flex items-center gap-2">
            <Trash2 className="text-red-600" /> Delete Report
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This report will be soft-deleted. The citizen will be notified with your message, and the action will be audited.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Message for Citizen</label>
            <Textarea 
              placeholder="Explain to the citizen why their report is being removed..." 
              value={messageForCitizen}
              onChange={(e) => setMessageForCitizen(e.target.value)}
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Internal Reason</label>
            <Textarea 
              placeholder="Audit log reason (not visible to citizen)..." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onConfirm(messageForCitizen, reason)} disabled={!messageForCitizen.trim() || !reason.trim()} className="bg-red-600 text-white hover:bg-red-700">
              Confirm Delete
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
);
DeleteReportModal.displayName = "DeleteReportModal";
