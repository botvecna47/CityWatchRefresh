import { useState } from "react";
import { Search, Ban, CheckCircle2 } from "lucide-react";
import { useAppContext, User } from "../../store";
import { Button, Input, Badge } from "../../components/ui";

export function UserManagement({ users, title }: { users: User[], title: string }) {
  const { banUser, unbanUser } = useAppContext();
  const [search, setSearch] = useState("");

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-[#1A4331] font-serif">{title}</h2>
        <div className="w-full sm:w-64 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input placeholder="Search citizens..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm font-serif min-w-[600px]">
          <thead className="bg-[#FDFDF7] border-b border-gray-200 text-gray-600">
            <tr>
              <th className="p-4 font-medium">User Profile</th>
              <th className="p-4 font-medium">System Role</th>
              <th className="p-4 font-medium">Account Status</th>
              <th className="p-4 font-medium text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                    <div>
                      <p className="font-bold text-[#1A4331]">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">Citizen</Badge>
                </td>
                <td className="p-4">
                  {u.status === "active" ? (
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div> Banned
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {u.status === "active" ? (
                    <Button variant="outline" size="sm" onClick={() => banUser(u.id)} className="text-red-600 border-red-200 hover:bg-red-50 h-8">
                      <Ban className="w-4 h-4 mr-1" /> Suspend
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => unbanUser(u.id)} className="text-green-600 border-green-200 hover:bg-green-50 h-8">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Restore
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No users found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
