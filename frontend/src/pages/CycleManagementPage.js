import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CalendarDays, Plus, Check } from 'lucide-react';
import { format } from 'date-fns';

export default function CycleManagementPage() {
  const { cycles, addCycle, setActiveCycle } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [newCycle, setNewCycle] = useState({ name: '', startDate: '', endDate: '' });

  const handleAdd = () => {
    if (!newCycle.name || !newCycle.startDate || !newCycle.endDate) {
      toast.error('Please fill all fields');
      return;
    }
    addCycle(newCycle);
    toast.success('Cycle created successfully');
    setShowAdd(false);
    setNewCycle({ name: '', startDate: '', endDate: '' });
  };

  const handleSetActive = (id) => {
    setActiveCycle(id);
    toast.success('Active cycle updated');
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="cycle-management-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admission Cycle Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage admission cycles</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-blue-500 hover:bg-blue-600 text-white" data-testid="add-cycle-btn">
          <Plus className="w-4 h-4 mr-1.5" />Create Cycle
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {cycles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No cycles created</p>
              <p className="text-xs mt-1">Create your first admission cycle to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Cycle Name</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Start Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">End Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map(c => (
                  <TableRow key={c.id} data-testid={`cycle-row-${c.id}`}>
                    <TableCell className="text-sm font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.startDate ? format(new Date(c.startDate), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.endDate ? format(new Date(c.endDate), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      {c.isActive ? (
                        <Badge className="text-[10px] bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!c.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleSetActive(c.id)}
                          data-testid={`set-active-btn-${c.id}`}
                        >
                          <Check className="w-3 h-3 mr-1" />Set Active
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent data-testid="add-cycle-dialog">
          <DialogHeader>
            <DialogTitle>Create New Cycle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs">Cycle Name *</Label>
              <Input value={newCycle.name} onChange={(e) => setNewCycle(p => ({ ...p, name: e.target.value }))} placeholder="e.g., MBA 2025-26 Batch 1" data-testid="cycle-name-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Start Date *</Label>
                <Input type="date" value={newCycle.startDate} onChange={(e) => setNewCycle(p => ({ ...p, startDate: e.target.value }))} data-testid="cycle-start-date-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">End Date *</Label>
                <Input type="date" value={newCycle.endDate} onChange={(e) => setNewCycle(p => ({ ...p, endDate: e.target.value }))} data-testid="cycle-end-date-input" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)} data-testid="add-cycle-cancel-btn">Cancel</Button>
            <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 text-white" data-testid="add-cycle-submit-btn">Create Cycle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
