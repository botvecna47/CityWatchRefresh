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
    <div className="bg-white border-y sm:border border-gray-100 p-2 sm:p-3 sm:rounded-sm shadow-sm mb-4">
      <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1 items-center">
        <div className="flex items-center gap-2 text-[#1A4331] font-bold pl-1 pr-2 border-r border-gray-200">
          <Filter className="w-4 h-4" />
        </div>
        
        <div className="min-w-[120px] sm:min-w-[150px]">
          <Input 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-50 h-8 text-xs sm:text-sm"
          />
        </div>

        <select 
          className="h-8 rounded-md border border-input bg-background px-2 text-xs sm:text-sm min-w-[110px]"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Reported">Reported</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select 
          className="h-8 rounded-md border border-input bg-background px-2 text-xs sm:text-sm min-w-[110px]"
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
        >
          {availableAreas.map((area: string) => (
            <option key={area} value={area}>{area === 'All' ? 'All Areas' : area}</option>
          ))}
        </select>

        <select 
          className="h-8 rounded-md border border-input bg-background px-2 text-xs sm:text-sm min-w-[110px]"
          value={filterUrgency}
          onChange={(e) => setFilterUrgency(e.target.value)}
        >
          <option value="All">All Urgency</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        
        {(filterStatus !== 'All' || filterArea !== 'All' || filterUrgency !== 'All' || search !== '') && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs h-8 whitespace-nowrap text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              setFilterStatus('All');
              setFilterArea('All');
              setFilterUrgency('All');
              setSearch('');
            }}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
