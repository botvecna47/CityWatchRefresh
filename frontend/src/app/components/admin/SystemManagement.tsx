import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Map as MapIcon, Layers, Megaphone, Zap } from "lucide-react";
import { useAppContext } from "../../store";
import { Card, Button, Input, Textarea } from "../../components/ui";
import { toast } from "sonner";
import { masterDataService, adminService } from "../../api/services";
import { apiClient } from "../../api/apiClient";

export function SystemManagement() {
  const { areas, categories, refreshMasterData } = useAppContext();
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [mobileBypass, setMobileBypass] = useState(() => localStorage.getItem('CITYWATCH_MOBILE_BYPASS') === 'true');
  
  const toggleBypass = () => {
    const newVal = !mobileBypass;
    setMobileBypass(newVal);
    localStorage.setItem('CITYWATCH_MOBILE_BYPASS', newVal.toString());
    toast.success(`Mobile restriction bypass ${newVal ? 'ENABLED' : 'DISABLED'}`);
  };
  
  const [newArea, setNewArea] = useState({ name: "", city: "Nanded", centerLat: 19.15, centerLng: 77.31 });
  const [newCat, setNewCat] = useState({ name: "", description: "", defaultSlaHours: 72 });

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/api/areas", newArea);
      toast.success("Area added successfully");
      setShowAreaForm(false);
      refreshMasterData();
    } catch { toast.error("Failed to add area"); }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/api/categories", newCat);
      toast.success("Category added successfully");
      setShowCatForm(false);
      refreshMasterData();
    } catch { toast.error("Failed to add category"); }
  };

  const handleDeleteArea = async (id: number) => {
    if (!window.confirm("Soft delete this area? This will hide it from new reports but keep old ones intact.")) return;
    try {
      await apiClient.delete(`/api/areas/${id}`);
      toast.success("Area soft deleted");
      refreshMasterData();
    } catch { toast.error("Delete failed"); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Soft delete this category? This will hide it from new reports but keep old ones intact.")) return;
    try {
      await apiClient.delete(`/api/categories/${id}`);
      toast.success("Category soft deleted");
      refreshMasterData();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Area Management */}
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-[#1A4331] font-serif flex items-center gap-3">
              <MapIcon className="w-6 h-6 text-emerald-600" /> Manage City Areas
            </h3>
            <Button size="sm" onClick={() => setShowAreaForm(!showAreaForm)} variant="outline">
              {showAreaForm ? "Cancel" : "Add Area"}
            </Button>
          </div>

          <AnimatePresence>
            {showAreaForm && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddArea}
                className="space-y-4 mb-6 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 overflow-hidden shadow-sm"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Area Name</label>
                    <Input placeholder="e.g. Taroda Naka" value={newArea.name} onChange={e => setNewArea({...newArea, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Center Lat</label>
                    <Input type="number" step="0.0001" value={newArea.centerLat || ""} onChange={e => setNewArea({...newArea, centerLat: parseFloat(e.target.value) || 0})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Center Lng</label>
                    <Input type="number" step="0.0001" value={newArea.centerLng || ""} onChange={e => setNewArea({...newArea, centerLng: parseFloat(e.target.value) || 0})} required />
                  </div>
                </div>
                <Button size="sm" className="w-full h-11 bg-[#1A4331] hover:bg-[#2E7D32] text-white rounded-xl font-bold shadow-md">Save New Area</Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {areas.map(area => (
              <div key={area.id} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-xl border border-gray-100 group hover:border-emerald-200 transition-colors">
                <div>
                  <span className="text-base font-bold text-gray-700 block">{area.name}</span>
                  <span className="text-xs font-semibold text-gray-400 font-mono mt-1 block">{area.centerLat}, {area.centerLng}</span>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteArea(area.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Management */}
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-[#1A4331] font-serif flex items-center gap-3">
              <Layers className="w-6 h-6 text-blue-600" /> Issue Categories &amp; SLA
            </h3>
            <Button size="sm" onClick={() => setShowCatForm(!showCatForm)} variant="outline">
              {showCatForm ? "Cancel" : "Add Category"}
            </Button>
          </div>

          <AnimatePresence>
            {showCatForm && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddCategory}
                className="space-y-4 mb-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 overflow-hidden shadow-sm"
              >
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Category Name</label>
                  <Input placeholder="e.g. ANIMAL_WELFARE" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value.toUpperCase()})} required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Default SLA (Hours)</label>
                  <Input type="number" value={newCat.defaultSlaHours || ""} onChange={e => setNewCat({...newCat, defaultSlaHours: parseInt(e.target.value) || 0})} required />
                </div>
                <Button size="sm" className="w-full h-11 bg-[#1A4331] hover:bg-[#2E7D32] text-white rounded-xl font-bold shadow-md mt-2">Save Category</Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                <div>
                  <span className="text-base font-bold text-gray-700 block">{cat.name}</span>
                  <span className="text-xs font-bold text-[#1A4331]/60 mt-1 block bg-[#1A4331]/5 inline-block px-2 py-0.5 rounded-md border border-[#1A4331]/10">SLA: {cat.defaultSlaHours} hrs</span>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteCategory(cat.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Developer Tools */}
      <Card className="p-6 bg-amber-50/50 border border-amber-200/50 shadow-sm rounded-3xl mt-8">
        <h3 className="text-xl font-bold text-amber-900 font-serif flex items-center gap-3 mb-6 pb-4 border-b border-amber-200/50">
          <Zap className="w-6 h-6 text-amber-600" /> Developer Tools
        </h3>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-100 shadow-sm flex-1">
            <div>
              <p className="font-bold text-gray-800">Mobile Restriction Bypass</p>
              <p className="text-xs text-gray-500 font-medium">Disable strict mobile-device checks for coordinator reporting.</p>
            </div>
            <button 
              onClick={toggleBypass}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${mobileBypass ? 'bg-amber-500' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mobileBypass ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-100 shadow-sm flex-1">
            <div>
              <p className="font-bold text-gray-800">Seed Mock Notifications</p>
              <p className="text-xs text-gray-500 font-medium">Generate 10 fake notifications for testing the UI.</p>
            </div>
            <Button 
              size="sm" 
              onClick={async () => {
                try {
                  await adminService.seedNotifications();
                  toast.success("Notifications seeded!");
                } catch {
                  toast.error("Failed to seed notifications.");
                }
              }}
              className="bg-amber-100 text-amber-800 hover:bg-amber-200"
            >
              Seed
            </Button>
          </div>
        </div>
      </Card>

      <BroadcastTool />
    </div>
  );
}

function BroadcastTool() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setIsSending(true);
    try {
      await adminService.broadcast(title.trim(), message.trim());
      toast.success("Broadcast sent to all users successfully!");
      setTitle("");
      setMessage("");
    } catch {
      toast.error("Failed to send broadcast. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="p-8 bg-white border border-gray-100 shadow-sm max-w-2xl rounded-3xl mt-8">
      <div className="pb-4 mb-6 border-b border-gray-100">
        <h3 className="text-2xl font-bold text-[#1A4331] mb-2 font-serif flex items-center gap-3">
          <Megaphone className="w-6 h-6 text-[#2E7D32]" /> System Broadcast
        </h3>
        <p className="text-sm text-gray-500 font-medium">
          Send a global push notification to all registered users. Each user will see it in their notification bell.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleBroadcast}>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Message Title</label>
          <Input
            placeholder="e.g. System Maintenance Notice"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Content</label>
          <Textarea
            placeholder="Write your announcement here..."
            className="min-h-[100px]"
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isSending || !title.trim() || !message.trim()}
          className="bg-[#1A4331] hover:bg-[#2E7D32] text-white font-bold h-12 px-8 rounded-xl shadow-md w-full sm:w-auto"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isSending ? "Sending..." : "Launch Broadcast"}
        </Button>
      </form>
    </Card>
  );
}
