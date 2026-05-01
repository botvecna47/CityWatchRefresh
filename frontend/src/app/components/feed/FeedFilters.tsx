import { Filter } from "lucide-react";
import { Card, Button, Input } from "../ui";

export function FeedFilters({
  search, setSearch,
  filterStatus, setFilterStatus,
  filterArea, setFilterArea,
  filterUrgency, setFilterUrgency,
  availableAreas
}: any) {
  return (
    <Card className="p-4 bg-white border border-gray-200 shadow-sm">
      <div className="hidden md:flex items-center gap-2 font-bold text-[#1A4331] mb-4 border-b border-gray-100 pb-2">
        <Filter className="w-5 h-5" /> Filters
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Search</label>
          <Input 
            placeholder="Search issues..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-50"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
          <select 
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Area</label>
          <select 
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
          >
            {availableAreas.map((area: string) => (
              <option key={area} value={area}>{area === 'All' ? 'All Areas' : area}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Urgency</label>
          <select 
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
          >
            <option value="All">All Urgency Levels</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        
        {(filterStatus !== 'All' || filterArea !== 'All' || filterUrgency !== 'All' || search !== '') && (
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={() => {
              setFilterStatus('All');
              setFilterArea('All');
              setFilterUrgency('All');
              setSearch('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </Card>
  );
}
