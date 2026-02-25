import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Users, Plus, KeyRound } from 'lucide-react';

export default function UserManagementPage() {
  const { users, addUser, updateUser } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', username: '', password: '', role: 'AdCom Member' });
  const [resetPw, setResetPw] = useState({ show: false, userId: null, password: '' });

  const handleAdd = () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
      toast.error('Please fill all required fields');
      return;
    }
    if (users.find(u => u.username === newUser.username)) {
      toast.error('Username already exists');
      return;
    }
    addUser({ ...newUser, isAdminAccess: false });
    toast.success('User created successfully');
    setShowAdd(false);
    setNewUser({ name: '', email: '', username: '', password: '', role: 'AdCom Member' });
  };

  const toggleAdminAccess = (userId, current) => {
    updateUser(userId, { isAdminAccess: !current });
    toast.success(`Admin access ${!current ? 'granted' : 'revoked'}`);
  };

  const handleResetPassword = () => {
    if (!resetPw.password) { toast.error('Enter new password'); return; }
    updateUser(resetPw.userId, { password: resetPw.password });
    toast.success('Password reset successfully');
    setResetPw({ show: false, userId: null, password: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="user-management-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members and permissions</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-blue-500 hover:bg-blue-600 text-white" data-testid="add-user-btn">
          <Plus className="w-4 h-4 mr-1.5" />Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-[11px] uppercase tracking-wider font-bold">Name</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-bold">Username</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-bold">Email</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-bold">Role</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-bold">Admin Access</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id} data-testid={`user-row-${u.id}`}>
                  <TableCell className="text-sm font-medium">{u.name}</TableCell>
                  <TableCell className="text-xs font-mono">{u.username}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {u.role === 'Admin' ? (
                      <span className="text-xs text-muted-foreground">Built-in</span>
                    ) : (
                      <Switch
                        checked={u.isAdminAccess || false}
                        onCheckedChange={() => toggleAdminAccess(u.id, u.isAdminAccess)}
                        data-testid={`admin-toggle-${u.id}`}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setResetPw({ show: true, userId: u.id, password: '' })}
                      data-testid={`reset-pw-btn-${u.id}`}
                    >
                      <KeyRound className="w-3 h-3 mr-1" />Reset
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent data-testid="add-user-dialog">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs">Name *</Label>
              <Input value={newUser.name} onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="Full name" data-testid="new-user-name-input" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input value={newUser.email} onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="Email address" data-testid="new-user-email-input" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Username *</Label>
              <Input value={newUser.username} onChange={(e) => setNewUser(p => ({ ...p, username: e.target.value }))} placeholder="Username" data-testid="new-user-username-input" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Password *</Label>
              <Input type="password" value={newUser.password} onChange={(e) => setNewUser(p => ({ ...p, password: e.target.value }))} placeholder="Password" data-testid="new-user-password-input" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Role</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser(p => ({ ...p, role: v }))}>
                <SelectTrigger data-testid="new-user-role-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="AdCom Member">AdCom Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)} data-testid="add-user-cancel-btn">Cancel</Button>
            <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 text-white" data-testid="add-user-submit-btn">Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPw.show} onOpenChange={(v) => !v && setResetPw({ show: false, userId: null, password: '' })}>
        <DialogContent data-testid="reset-pw-dialog">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">New Password</Label>
            <Input type="password" value={resetPw.password} onChange={(e) => setResetPw(p => ({ ...p, password: e.target.value }))} placeholder="Enter new password" data-testid="reset-pw-input" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPw({ show: false, userId: null, password: '' })} data-testid="reset-pw-cancel-btn">Cancel</Button>
            <Button onClick={handleResetPassword} className="bg-blue-500 hover:bg-blue-600 text-white" data-testid="reset-pw-submit-btn">Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
