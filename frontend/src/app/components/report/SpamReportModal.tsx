import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { Button, Textarea } from "../../components/ui";

interface SpamReportModalProps {
  showSpamModal: boolean;
  setShowSpamModal: (show: boolean) => void;
  spamReason: string;
  setSpamReason: (reason: string) => void;
  confirmReportSpam: () => void;
}

export function SpamReportModal({ showSpamModal, setShowSpamModal, spamReason, setSpamReason, confirmReportSpam }: SpamReportModalProps) {
  if (!showSpamModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl relative text-[#1A4331]"
      >
        <h3 className="text-xl font-bold mb-2 font-serif flex items-center gap-2">
          <AlertTriangle className="text-red-500" /> Report Spam
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Please provide a reason for flagging this report as spam or abuse.
        </p>
        
        <Textarea 
          placeholder="Reason for reporting..." 
          value={spamReason}
          onChange={(e) => setSpamReason(e.target.value)}
          className="mb-4"
          rows={3}
        />
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowSpamModal(false)}>
            Cancel
          </Button>
          <Button onClick={confirmReportSpam} disabled={!spamReason.trim()} className="bg-red-600 text-white hover:bg-red-700">
            Submit Report
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
