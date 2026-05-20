import { useState } from "react";
import { Search, Ban, CheckCircle2 } from "lucide-react";
import { useAdmin } from "../../contexts/AdminContext";
import { Button, Input, Badge } from "../../components/ui";
import { PaginationControls } from "../../components/PaginationControls";

export function UserManagement({ users, title }: { users: User[], title: string }) {
  const { banUser, unbanUser, usersPage, setUsersPage } = useAdmin();
  const [search, setSearch] = useState("");

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filtered.slice(usersPage * ITEMS_PER_PAGE, (usersPage + 1) * ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-[#1A4331] font-serif">{title}</h2>
        <div className="w-full sm:w-64 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input placeholder="Search citizens..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full" />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm overflow-x-auto p-2">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-[#FDFDF7] border-b border-gray-100 text-gray-500 font-serif">
            <tr>
              <th className="px-6 py-4 font-bold text-[#1A4331]">User Profile</th>
              <th className="px-6 py-4 font-bold text-[#1A4331]">System Role</th>
              <th className="px-6 py-4 font-bold text-[#1A4331]">Account Status</th>
              <th className="px-6 py-4 font-bold text-[#1A4331] text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedUsers.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt="" className="w-10 h-10 rounded-full border border-gray-100 shadow-sm bg-white" />
                    <div>
                      <p className="font-bold text-[#1A4331]">{u.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 shadow-sm font-bold">Citizen</Badge>
                </td>
                <td className="px-6 py-4">
                  {u.status === "active" ? (
                    <span className="inline-flex items-center gap-1 text-green-700 text-xs font-bold bg-green-50 border border-green-100 shadow-sm px-2.5 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-700 text-xs font-bold bg-red-50 border border-red-100 shadow-sm px-2.5 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Banned
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {u.status === "active" ? (
                    <Button variant="outline" size="sm" onClick={() => banUser(u.id)} className="text-red-600 border-red-200 hover:bg-red-50 h-9 rounded-xl font-bold shadow-sm">
                      <Ban className="w-4 h-4 mr-1.5" /> Suspend
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => unbanUser(u.id)} className="text-green-600 border-green-200 hover:bg-green-50 h-9 rounded-xl font-bold shadow-sm">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Restore
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
      <PaginationControls 
        currentPage={usersPage} 
        totalPages={totalPages} 
        onPageChange={setUsersPage} 
      />
    </div>
  );
}
