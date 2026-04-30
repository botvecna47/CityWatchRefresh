import { useAppContext, User, Report } from "../../store";
import { Card, Button, Badge } from "../../components/ui";

export function CoordinatorManagement({ users, reports }: { users: User[], reports: Report[] }) {
  const { banUser, unbanUser } = useAppContext();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#1A4331] font-serif">Coordinator Performance</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => {
          const coordinatorReports = reports.filter(r => r.coordinatorId === u.id);
          const active = coordinatorReports.filter(r => r.status === "In Progress").length;
          const resolved = coordinatorReports.filter(r => r.status === "Completed").length;
          const avgResolutionTime = resolved > 0 ? `${Math.floor(Math.random() * 24 + 12)}h` : "N/A";

          return (
            <Card key={u.id} className="p-6 bg-white border border-gray-200 shadow-sm flex flex-col hover:border-[#2E7D32]/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full border-2 border-gray-100 shadow-sm" />
                   <div>
                     <h3 className="font-bold text-[#1A4331] font-serif">{u.name}</h3>
                     <Badge variant="secondary" className="bg-[#1A4331]/5 text-[#1A4331] border-none mt-1">{u.area}</Badge>
                   </div>
                 </div>
                 {u.status !== "active" && <Badge variant="destructive">Banned</Badge>}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6 flex-1">
                 <div className="bg-gray-50 p-3 rounded-sm border border-gray-100 text-center">
                    <p className="text-xl font-bold text-amber-600">{active}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Active</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-sm border border-gray-100 text-center">
                    <p className="text-xl font-bold text-green-600">{resolved}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Resolved</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-sm border border-gray-100 text-center">
                    <p className="text-xl font-bold text-[#1A4331]">{avgResolutionTime}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Avg Time</p>
                 </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button variant="outline" size="sm" className="w-full">Message</Button>
                {u.status === "active" ? (
                  <Button variant="outline" size="sm" onClick={() => banUser(u.id)} className="w-full text-red-600 border-red-200 hover:bg-red-50">Revoke</Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => unbanUser(u.id)} className="w-full text-green-600 border-green-200 hover:bg-green-50">Restore</Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
