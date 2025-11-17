/**
 * Freelancer Project Manager - Timeline & Invoice Management
 */

'use client';

import { useRouter } from 'next/router';
import { useUser } from '@/shared/hooks/useUser';
import { AdBanner, RewardedAdButton } from '@/shared/components/ads/AdBanner';
import { Flame, Award, TrendingUp, Calendar, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Project {
  id: string;
  name: string;
  client: string;
  startDate: string;
  deadline: string;
  budget: number;
  status: 'planning' | 'in-progress' | 'completed';
  progress: number;
}

interface Invoice {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  status: 'draft' | 'sent' | 'paid';
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useUser();
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Website Redesign',
      client: 'Tech Startup',
      startDate: 'Nov 1',
      deadline: 'Dec 15',
      budget: 5000,
      status: 'in-progress',
      progress: 65,
    },
    {
      id: '2',
      name: 'Logo Design',
      client: 'Creative Agency',
      startDate: 'Oct 15',
      deadline: 'Nov 20',
      budget: 2000,
      status: 'completed',
      progress: 100,
    },
  ]);
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: '1', projectId: '1', amount: 2500, date: 'Nov 10', status: 'sent' },
    { id: '2', projectId: '2', amount: 2000, date: 'Oct 20', status: 'paid' },
  ]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const activeProjects = projects.filter(p => p.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {!user?.isPremium && <AdBanner placement="top" appId="freelancer-pm" />}

      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-white/80">Manage projects & invoices like a pro 💼</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold mb-2">
              <Flame className="w-6 h-6" />
              {user?.gamification?.streak || 0} Day Streak
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <p className="text-gray-600 text-sm">Total Billed</p>
            <h3 className="text-3xl font-bold text-green-600">${totalBilled.toLocaleString()}</h3>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <p className="text-gray-600 text-sm">Pending Payment</p>
            <h3 className="text-3xl font-bold text-yellow-600">${totalPending.toLocaleString()}</h3>
            <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <p className="text-gray-600 text-sm">Active Projects</p>
            <h3 className="text-3xl font-bold text-blue-600">{activeProjects}</h3>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <p className="text-gray-600 text-sm">Completed</p>
            <h3 className="text-3xl font-bold text-purple-600">{projects.filter(p => p.status === 'completed').length}</h3>
            <p className="text-xs text-gray-500 mt-1">Finished projects</p>
          </div>
        </div>

        {/* Projects Timeline */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-violet-600" />
              Projects
            </h2>
            <button className="bg-violet-600 text-white px-4 py-2 rounded font-bold hover:bg-violet-700">
              + New Project
            </button>
          </div>
          <div className="space-y-3">
            {projects.map(project => (
              <div key={project.id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-violet-300">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.client}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'completed' ? '✓ Completed' :
                     project.status === 'in-progress' ? 'In Progress' : 'Planning'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {project.deadline}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${project.budget.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-violet-600 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{project.progress}% Complete</p>
              </div>
            ))}
          </div>
        </div>

        {/* Invoicing */}
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Invoices
            </h2>
            <button
              onClick={() => setShowInvoiceForm(!showInvoiceForm)}
              className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
            >
              + Create Invoice
            </button>
          </div>

          {showInvoiceForm && (
            <div className="bg-green-50 p-6 rounded-lg mb-6 border-2 border-green-200">
              <h3 className="font-bold text-lg mb-4">New Invoice</h3>
              <div className="space-y-4">
                <select className="w-full p-3 border-2 border-gray-300 rounded-lg">
                  <option>Select Project...</option>
                  {projects.map(p => <option key={p.id}>{p.name}</option>)}
                </select>
                <input type="number" placeholder="Amount ($)" className="w-full p-3 border-2 border-gray-300 rounded-lg" />
                <input type="date" className="w-full p-3 border-2 border-gray-300 rounded-lg" />
                <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
                  Generate Invoice
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {invoices.map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-green-400">
                <div>
                  <p className="font-bold text-gray-900">Invoice #{invoice.id}</p>
                  <p className="text-sm text-gray-600">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-green-600">${invoice.amount.toLocaleString()}</span>
                  <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status === 'paid' ? '✓ Paid' :
                     invoice.status === 'sent' ? 'Sent' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!user?.isPremium && <AdBanner placement="bottom" appId="freelancer-pm" />}
    </div>
  );
}
