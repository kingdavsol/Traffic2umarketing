'use client';
import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner } from '@/shared/components/ads/AdBanner';
import { Flame, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const TEAM_MEMBERS = [
  { id: 1, name: 'Sarah Chen', role: 'Manager', status: 'online', hourlyRate: 18 },
  { id: 2, name: 'Marcus Johnson', role: 'Staff', status: 'online', hourlyRate: 15 },
  { id: 3, name: 'Emily Rodriguez', role: 'Staff', status: 'offline', hourlyRate: 15 },
  { id: 4, name: 'David Park', role: 'Staff', status: 'on-break', hourlyRate: 15 }
];

const UPCOMING_SHIFTS = [
  { id: 1, member: 'Sarah Chen', date: 'Today', time: '2:00 PM - 10:00 PM', hours: 8, status: 'confirmed' },
  { id: 2, member: 'Marcus Johnson', date: 'Today', time: '6:00 PM - 11:00 PM', hours: 5, status: 'confirmed' },
  { id: 3, member: 'Emily Rodriguez', date: 'Tomorrow', time: '9:00 AM - 5:00 PM', hours: 8, status: 'pending' },
  { id: 4, member: 'David Park', date: 'Tomorrow', time: '10:00 AM - 6:00 PM', hours: 8, status: 'confirmed' }
];

const SWAP_REQUESTS = [
  { id: 1, requester: 'Emily Rodriguez', requestedWith: 'Marcus Johnson', originalShift: 'Tomorrow 9AM-5PM', status: 'pending' }
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState('calendar');
  const [shifts, setShifts] = useState(UPCOMING_SHIFTS);
  const [swapRequests, setSwapRequests] = useState(SWAP_REQUESTS);
  const [showNewShift, setShowNewShift] = useState(false);
  const [newShift, setNewShift] = useState({ member: '', date: '', startTime: '', endTime: '' });

  const totalHours = shifts.filter(s => s.status === 'confirmed').reduce((sum, s) => sum + s.hours, 0);
  const pendingShifts = shifts.filter(s => s.status === 'pending').length;
  const payroll = totalHours * 16; // avg hourly rate
  const onlineCount = TEAM_MEMBERS.filter(m => m.status === 'online').length;

  const handleApproveSwap = (id) => {
    setSwapRequests(swapRequests.filter(s => s.id !== id));
  };

  const handleCreateShift = () => {
    if (newShift.member && newShift.date && newShift.startTime && newShift.endTime) {
      setShifts([...shifts, {
        id: Date.now(),
        member: newShift.member,
        date: newShift.date,
        time: `${newShift.startTime} - ${newShift.endTime}`,
        hours: 8,
        status: 'confirmed'
      }]);
      setNewShift({ member: '', date: '', startTime: '', endTime: '' });
      setShowNewShift(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="shift-management" />}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 text-white px-4 py-6">
        <h1 className="text-3xl font-bold">Manage Shifts Effortlessly</h1>
        <div className="flex gap-2 text-2xl font-bold mt-4"><Flame className="w-6 h-6" />{user?.gamification?.streak || 0} Day Streak</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">Shifts Scheduled</p>
            <h3 className="text-3xl font-bold text-blue-600">{shifts.length}</h3>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-sm text-gray-600">Team Online</p>
            <h3 className="text-3xl font-bold text-green-600">{onlineCount}/{TEAM_MEMBERS.length}</h3>
            <p className="text-xs text-gray-500 mt-1">Right now</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-sm text-gray-600">Total Hours</p>
            <h3 className="text-3xl font-bold text-purple-600">{totalHours}h</h3>
            <p className="text-xs text-gray-500 mt-1">Confirmed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600">Payroll</p>
            <h3 className="text-3xl font-bold text-yellow-600">${payroll}</h3>
            <p className="text-xs text-gray-500 mt-1">This week estimate</p>
          </div>
        </div>

        {/* Alerts */}
        {swapRequests.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-yellow-800">{swapRequests.length} Pending Shift Swap Request(s)</p>
                <p className="text-sm text-yellow-700">Review and approve/deny swap requests from your team</p>
              </div>
            </div>
          </div>
        )}

        {pendingShifts > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p className="font-bold text-blue-800">{pendingShifts} shifts pending confirmation</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 flex-wrap">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 font-bold ${activeTab === 'calendar' ? 'border-b-4 border-cyan-600 text-cyan-600' : 'text-gray-600'}`}
          >
            📅 Schedule
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-6 py-3 font-bold ${activeTab === 'team' ? 'border-b-4 border-cyan-600 text-cyan-600' : 'text-gray-600'}`}
          >
            👥 Team ({TEAM_MEMBERS.length})
          </button>
          <button
            onClick={() => setActiveTab('swaps')}
            className={`px-6 py-3 font-bold ${activeTab === 'swaps' ? 'border-b-4 border-cyan-600 text-cyan-600' : 'text-gray-600'}`}
          >
            🔄 Swap Requests
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-6 py-3 font-bold ${activeTab === 'payroll' ? 'border-b-4 border-cyan-600 text-cyan-600' : 'text-gray-600'}`}
          >
            💰 Payroll
          </button>
        </div>

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            {!showNewShift ? (
              <button
                onClick={() => setShowNewShift(true)}
                className="w-full bg-cyan-600 text-white px-6 py-3 rounded font-bold text-lg hover:bg-cyan-700"
              >
                + Schedule New Shift
              </button>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 border-2 border-cyan-400">
                <h3 className="font-bold text-lg mb-4">Create New Shift</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Team Member</label>
                    <select
                      value={newShift.member}
                      onChange={(e) => setNewShift({...newShift, member: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded px-3 py-2"
                    >
                      <option value="">Select member</option>
                      {TEAM_MEMBERS.map(m => (<option key={m.id} value={m.name}>{m.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Date</label>
                    <input
                      type="date"
                      value={newShift.date}
                      onChange={(e) => setNewShift({...newShift, date: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Start Time</label>
                      <input
                        type="time"
                        value={newShift.startTime}
                        onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">End Time</label>
                      <input
                        type="time"
                        value={newShift.endTime}
                        onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateShift}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
                    >
                      Create Shift
                    </button>
                    <button
                      onClick={() => setShowNewShift(false)}
                      className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {shifts.map((shift) => (
                <div key={shift.id} className={`p-4 rounded-lg border-2 ${shift.status === 'confirmed' ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{shift.member}</p>
                      <p className="text-sm text-gray-600">{shift.date} • {shift.time}</p>
                      <p className="text-sm text-gray-600 mt-1">Duration: {shift.hours} hours</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-bold ${shift.status === 'confirmed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                      {shift.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-3">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow p-4 border-2 border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{member.name}</h3>
                      <span className={`w-3 h-3 rounded-full ${member.status === 'online' ? 'bg-green-500' : member.status === 'on-break' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                    </div>
                    <p className="text-sm text-gray-600">{member.role} • ${member.hourlyRate}/hr</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-bold ${member.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {member.status === 'online' ? 'Online' : member.status === 'on-break' ? 'On Break' : 'Offline'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Swap Requests Tab */}
        {activeTab === 'swaps' && (
          <div className="space-y-4">
            {swapRequests.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-lg">
                <p className="text-gray-500">No pending swap requests</p>
              </div>
            ) : (
              swapRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow p-6 border-2 border-yellow-400">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold">{request.requester} ↔️ {request.requestedWith}</p>
                      <p className="text-sm text-gray-600 mt-1">Shift: {request.originalShift}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-bold">Pending</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveSwap(request.id)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">
                      Deny
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Payroll Tab */}
        {activeTab === 'payroll' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold mb-3">Total Payroll</h3>
                <p className="text-4xl font-bold text-cyan-600 mb-2">${payroll}</p>
                <p className="text-sm text-gray-600">This week ({totalHours} hours)</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold mb-3">Average Hourly Rate</h3>
                <p className="text-4xl font-bold text-purple-600 mb-2">$16.00</p>
                <p className="text-sm text-gray-600">Across all staff</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Breakdown by Member</h3>
              <div className="space-y-3">
                {TEAM_MEMBERS.map((member) => {
                  const memberShifts = shifts.filter(s => s.member === member.name && s.status === 'confirmed');
                  const memberHours = memberShifts.reduce((sum, s) => sum + s.hours, 0);
                  const memberPayroll = memberHours * member.hourlyRate;
                  return (
                    <div key={member.id} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                      <div>
                        <p className="font-bold">{member.name}</p>
                        <p className="text-sm text-gray-600">{memberHours} hours @ ${member.hourlyRate}/hr</p>
                      </div>
                      <p className="text-lg font-bold text-cyan-600">${memberPayroll}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
