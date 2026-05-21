import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import { Report, AreaEntity, CategoryEntity, Area, Status, Comment } from "../types";
import { complaintService, masterDataService } from "../api/services";

interface ComplaintContextType {
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  selectedReportId: string | null;
  setSelectedReportId: React.Dispatch<React.SetStateAction<string | null>>;
  areas: AreaEntity[];
  categories: CategoryEntity[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refreshMasterData: () => Promise<void>;
  refreshReports: (silent?: boolean, page?: number, size?: number, bbox?: string) => Promise<any>;
  addReport: (report: Partial<Report>) => Promise<void>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<void>;
  submitProof: (id: string, imageUrl: string, lat: number, lng: number) => Promise<void>;
  handleVote: (id: string, currentUserId?: string) => Promise<void>;
  deleteReport: (id: string, spamReportId?: string, resolveSpamReport?: (id: string) => void) => void;
  softDeleteReport: (id: string, messageForCitizen: string, reason: string) => Promise<void>;
  addComment: (reportId: string, comment: Comment) => void;
  fetchComments: (reportId: string) => Promise<void>;
  sendMessage: (reportId: string, content: string) => Promise<void>;
  fetchMessages: (reportId: string) => Promise<void>;
}

// ComplaintContext is kept internal — consumers use the useComplaint() hook
const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

const mapStatus = (s: string): Status => {
  switch ((s || "").toUpperCase()) {
    case "IN_PROGRESS": case "ASSIGNED": return "In Progress";
    case "COMPLETED": case "CLOSED": return "Completed";
    default: return "Reported";
  }
};

const toBackendStatus = (s: Status): string => {
  switch (s) {
    case "In Progress": return "IN_PROGRESS";
    case "Completed": return "COMPLETED";
    default: return "PENDING_REVIEW";
  }
};

const mapPriority = (p: string): "Low" | "Medium" | "High" => {
  switch ((p || "").toUpperCase()) {
    case "HIGH": return "High";
    case "MEDIUM": return "Medium";
    default: return "Low";
  }
};

export const ComplaintProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [areas, setAreas] = useState<AreaEntity[]>([]);
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMasterData = useCallback(async () => {
    try {
      const [areasRes, categoriesRes] = await Promise.all([masterDataService.getAreas(), masterDataService.getCategories()]);
      setAreas(areasRes);
      setCategories(categoriesRes);
    } catch (error) { console.error("Failed to fetch master data:", error); }
  }, []);

  const refreshReports = useCallback(async (silent = false, page = 0, size = 10, bbox?: string) => {
    if (!silent && page === 0) setLoading(true);
    try {
      const res: any = await complaintService.getAll(page, size, bbox);
      const data = res.content || res; // Handle Pageable or List
      if (!Array.isArray(data)) return;
      
      const mapped: Report[] = data.map((r: any) => ({
        id: String(r.id), title: r.title || (r.category ? r.category.replace(/_/g, " ") : "Reported Issue"),
        description: r.description || "", image: r.imageUrls?.length > 0 ? r.imageUrls[0] : "", additionalImages: r.imageUrls?.slice(1) || [],
        locationText: r.locationText || (r.areaName ? `${r.areaName}, Nanded` : "Nanded"), lat: r.latitude || 19.155, lng: r.longitude || 77.307,
        area: r.areaName as Area, status: mapStatus(r.status), authorId: String(r.citizenId), authorName: r.citizenName || "Citizen",
        authorAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.citizenName || "U")}`, upvotes: r.upvotes || 0,
        downvotes: 0, upvotedCitizenIds: r.upvotedCitizenIds ? [...r.upvotedCitizenIds] : [], category: r.category, comments: [], messages: [],
        createdAt: r.createdAt || new Date().toISOString(), urgency: mapPriority(r.priority), coordinatorId: r.coordinatorId ? String(r.coordinatorId) : undefined,
      }));
      
      if (page === 0) {
        setReports(prev => {
          if (prev.length === 0) return mapped;
          return mapped.map(m => {
            const existing = prev.find(p => p.id === m.id);
            if (existing) {
              return { ...m, comments: existing.comments, messages: existing.messages };
            }
            return m;
          });
        });
      } else {
        setReports(prev => {
          const newReports = mapped.filter(m => !prev.some(p => p.id === m.id));
          return [...prev, ...newReports];
        });
      }
      return res; // return Page object for totalElements etc
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      if (!silent && page === 0) setLoading(false);
    }
  }, []);

  const addReport = async (reportReq: Partial<Report>) => {
    try {
      await complaintService.submit({
        category: reportReq.category || "OTHER", title: reportReq.title || "Reported Issue", description: reportReq.description,
        imageUrls: [reportReq.image, ...(reportReq.additionalImages || [])].filter(Boolean) as string[], latitude: reportReq.lat, longitude: reportReq.lng,
        locationText: reportReq.locationText, areaName: reportReq.area,
      });
      refreshReports();
      toast.success("Complaint submitted successfully!");
    } catch { toast.error("Submission failed."); }
  };

  const updateReport = async (id: string, updates: Partial<Report>) => {
    setReports(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
    if (!updates.status) return;
    try { await complaintService.updateStatus(id, toBackendStatus(updates.status)); refreshReports(); }
    catch { toast.error("Update failed."); refreshReports(); }
  };

  const submitProof = async (id: string, imageUrl: string, lat: number, lng: number) => {
    try { await complaintService.submitProof(id, { imageUrl, latitude: lat, longitude: lng }); toast.success("Resolution proof submitted! Citizen will be notified."); refreshReports(); }
    catch { toast.error("Proof submission failed."); }
  };

  const handleVote = async (id: string, currentUserId?: string) => {
    let wasUpvoted = false;
    if (currentUserId) {
      setReports(prev => prev.map(r => {
        if (r.id !== id) return r;
        const ids = r.upvotedCitizenIds || [];
        wasUpvoted = ids.includes(currentUserId);
        return { ...r, upvotes: wasUpvoted ? r.upvotes - 1 : r.upvotes + 1, upvotedCitizenIds: wasUpvoted ? ids.filter(i => i !== currentUserId) : [...ids, currentUserId] };
      }));
    }
    try { await complaintService.upvote(id); if (wasUpvoted) toast.info("Upvote removed."); else toast.success("Upvoted! Thank you for your support."); }
    catch { refreshReports(); toast.error("Vote failed."); }
  };

  const softDeleteReport = async (id: string, messageForCitizen: string, reason: string) => {
    // Optimistic UI update
    setReports(prev => prev.filter(r => r.id !== id));
    try {
      await complaintService.softDelete(id, messageForCitizen, reason);
      toast.success("Report deleted and citizen notified.");
    } catch {
      toast.error("Failed to delete report.");
      refreshReports(); // rollback
    }
  };

  const deleteReport = async (id: string, spamReportId?: string, resolveSpamReport?: (id: string) => void) => {
    try { await complaintService.delete(id); setReports(prev => prev.filter(r => r.id !== id)); if (spamReportId && resolveSpamReport) resolveSpamReport(spamReportId); toast.success("Report deleted."); }
    catch { toast.error("Failed to delete report."); }
  };

  const addComment = async (reportId: string, comment: Comment) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, comments: [...(r.comments || []), comment] } : r));
    try {
      const saved = await complaintService.addComment(reportId, comment.text);
      setReports(prev => prev.map(r => {
        if (r.id !== reportId) return r;
        return { ...r, comments: [...(r.comments || []).filter(c => c.id !== comment.id), { id: String(saved.id), authorId: String(saved.authorId || ""), authorName: saved.authorName || comment.authorName, text: saved.content || comment.text, createdAt: saved.createdAt || comment.createdAt }]};
      }));
    } catch (e) {
      console.error("Failed to post comment", e);
    }
  };

  const fetchComments = async (reportId: string) => {
    try {
      const comments = await complaintService.getComments(reportId);
      setReports(prev => prev.map(r => r.id === reportId ? { 
        ...r, 
        comments: Array.isArray(comments) ? comments.map((c: any) => ({
          id: String(c.id), authorId: String(c.authorId || ""), authorName: c.authorName || "Unknown", text: c.content || "", createdAt: c.createdAt || new Date().toISOString()
        })) : [] 
      } : r));
    } catch (e) {
      console.error("Failed to fetch comments", e);
    }
  };

  const fetchMessages = async (reportId: string) => {
    try {
      const messages = await complaintService.getMessages(reportId);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, messages: Array.isArray(messages) ? messages : [] } : r));
    } catch (e) {
      console.error("Failed to fetch messages", e);
    }
  };

  const sendMessage = async (reportId: string, content: string) => {
    try {
      const saved = await complaintService.sendMessage(reportId, content);
      setReports(prev => prev.map(r => {
        if (r.id !== reportId) return r;
        return { ...r, messages: [...(r.messages || []), saved] };
      }));
    } catch (e) {
      toast.error("Failed to send message");
    }
  };

  return (
    <ComplaintContext.Provider value={{ reports, setReports, selectedReportId, setSelectedReportId, areas, categories, loading, setLoading, refreshMasterData, refreshReports, addReport, updateReport, submitProof, handleVote, deleteReport, softDeleteReport, addComment, fetchComments, sendMessage, fetchMessages }}>
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaint = () => { const context = useContext(ComplaintContext); if (!context) throw new Error("useComplaint error"); return context; };
