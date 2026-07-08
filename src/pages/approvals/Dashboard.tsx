import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../lib/auth';
import { approvalService } from '../../lib/supabaseServices';
import { BillEditApprovalRequest } from '../../types/sfa';
import { canApproveBillEdit } from '../../lib/permissions';
import { supabase } from '../../lib/supabase';

const ApprovalDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [requests, setRequests]   = useState<BillEditApprovalRequest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [responseNotes, setNotes] = useState<Record<string, string>>({});

  const isApprover = canApproveBillEdit(user);

  useEffect(() => {
    if (!user?.agencyId) return;
    loadRequests();

    // Real-time subscription — new requests ekkama notify wenawa
    const channel = supabase
      .channel('bill-approvals')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bill_edit_approval_requests',
        filter: `agency_id=eq.${user.agencyId}`,
      }, payload => {
        setRequests(prev => [payload.new as BillEditApprovalRequest, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadRequests = async () => {
    if (!user?.agencyId) return;
    setLoading(true);
    try {
      const data = await approvalService.getPending(user.agencyId);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!user) return;
    setResponding(requestId);
    try {
      await approvalService.respond(requestId, status, user.id, responseNotes[requestId]);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      alert(status === 'APPROVED' ? '✅ Approved!' : '❌ Rejected!');
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setResponding(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={24} />Bill Edit Approvals
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isApprover ? 'Pending approval requests — ඔයාගේ agency eka walata' : 'ඔයාගේ approval requests'}
          </p>
        </div>
        {requests.length > 0 && (
          <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
            {requests.length} pending
          </span>
        )}
      </div>

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}

      {!loading && !requests.length && (
        <div className="text-center py-16">
          <CheckCircle size={48} className="mx-auto text-green-400 mb-3" />
          <p className="text-gray-500">Pending approvals නැහැ ✅</p>
        </div>
      )}

      {requests.map(req => (
        <Card key={req.id} className="border-l-4 border-l-amber-400">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <CardTitle className="text-base">Bill Edit Request</CardTitle>
              </div>
              <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleString('si-LK')}</span>
            </div>
            <p className="text-sm text-gray-600">Requested by: <span className="font-medium">{req.requestedByName || req.requestedBy.slice(0, 8) + '...'}</span></p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Reason</p>
              <p className="text-sm bg-amber-50 p-3 rounded">{req.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Before (current)</p>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-24">
                  {JSON.stringify(req.changesBefore, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">After (requested)</p>
                <pre className="text-xs bg-blue-50 p-2 rounded overflow-auto max-h-24">
                  {JSON.stringify(req.changesAfter, null, 2)}
                </pre>
              </div>
            </div>

            {isApprover && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Response Note (optional)</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    value={responseNotes[req.id] ?? ''}
                    onChange={e => setNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                    placeholder="Approval / rejection reason..." />
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleRespond(req.id, 'APPROVED')}
                    disabled={responding === req.id}>
                    <CheckCircle size={16} className="mr-2" />
                    {responding === req.id ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => handleRespond(req.id, 'REJECTED')}
                    disabled={responding === req.id}>
                    <XCircle size={16} className="mr-2" />Reject
                  </Button>
                </div>
              </>
            )}

            {!isApprover && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded">
                <AlertTriangle size={14} className="text-amber-600" />
                <p className="text-xs text-amber-700">Agency Owner ගේ approval pending...</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ApprovalDashboard;
