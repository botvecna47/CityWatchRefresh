import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Map as MapIcon, Layers, Megaphone, Zap } from "lucide-react";
import { useAppContext } from "../../store";
import { Card, Button, Input, Textarea } from "../../components/ui";
import { toast } from "sonner";
import { masterDataService } from "../../api/services";
import { apiClient } from "../../api/apiClient";

export function SystemManagement() {
  const { areas, categories, refreshMasterData } = useAppContext();
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  
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
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1A4331] font-serif flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-emerald-600" /> Manage City Areas
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
                className="space-y-3 mb-6 p-4 bg-emerald-50 rounded-md border border-emerald-100 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Area Name</label>
                    <Input placeholder="e.g. Taroda Naka" value={newArea.name} onChange={e => setNewArea({...newArea, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Center Lat</label>
                    <Input type="number" step="0.0001" value={newArea.centerLat} onChange={e => setNewArea({...newArea, centerLat: parseFloat(e.target.value)})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Center Lng</label>
                    <Input type="number" step="0.0001" value={newArea.centerLng} onChange={e => setNewArea({...newArea, centerLng: parseFloat(e.target.value)})} required />
                  </div>
                </div>
                <Button size="sm" className="w-full bg-[#1A4331]">Save New Area</Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {areas.map(area => (
              <div key={area.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-sm border border-gray-100 group">
                <div>
                  <span className="text-sm font-bold text-gray-700 block">{area.name}</span>
                  <span className="text-[10px] text-gray-400">{area.centerLat}, {area.centerLng}</span>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteArea(area.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Management */}
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1A4331] font-serif flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" /> Issue Categories & SLA
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
                className="space-y-3 mb-6 p-4 bg-blue-50 rounded-md border border-blue-100 overflow-hidden"
              >
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Category Name</label>
                  <Input placeholder="e.g. ANIMAL_WELFARE" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value.toUpperCase()})} required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Default SLA (Hours)</label>
                  <Input type="number" value={newCat.defaultSlaHours} onChange={e => setNewCat({...newCat, defaultSlaHours: parseInt(e.target.value)})} required />
                </div>
                <Button size="sm" className="w-full bg-[#1A4331]">Save Category</Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-sm border border-gray-100 group">
                <div>
                  <span className="text-sm font-bold text-gray-700 block">{cat.name}</span>
                  <span className="text-[10px] text-gray-400">Resolution Target: {cat.defaultSlaHours} hrs</span>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteCategory(cat.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <BroadcastTool />
    </div>
  );
}

function BroadcastTool() {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm max-w-2xl">
      <h3 className="text-lg font-bold text-[#1A4331] mb-2 font-serif flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-[#2E7D32]" /> System Broadcast
      </h3>
      <p className="text-sm text-gray-500 mb-6 font-serif">Send a global push notification to specific user groups.</p>

      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Broadcast sent successfully!"); }}>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Target Audience</label>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-serif">
            <option>All Users (Citizens & Coordinators)</option>
            <option>Coordinators Only</option>
            <option>Citizens Only</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Message Title</label>
          <Input placeholder="e.g. System Maintenance Notice" required />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Content</label>
          <Textarea placeholder="Write your announcement here..." className="min-h-[100px]" required />
        </div>
        <Button className="bg-[#1A4331] hover:bg-[#112d21] text-white font-serif">
          <Zap className="w-4 h-4 mr-2" /> Launch Broadcast
        </Button>
      </form>
    </Card>
  );
}
