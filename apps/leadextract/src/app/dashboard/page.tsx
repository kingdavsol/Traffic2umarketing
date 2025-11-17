'use client';
import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@traffic2u/ui';
import { UserPlus, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [exporting, setExporting] = useState(false);

  const leads = [
    { id: '1', name: 'John Doe', title: 'CEO', company: 'Acme Corp', email: 'john@acme.com', extractedAt: '2024-03-15' },
    { id: '2', name: 'Jane Smith', title: 'VP Sales', company: 'Tech Inc', email: 'jane@tech.com', extractedAt: '2024-03-14' },
  ];

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/leads/export');

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the CSV blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">LeadExtract</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">Leads</Button>
            <Button variant="ghost" size="sm">Extension</Button>
            <Button variant="ghost" size="sm">Settings</Button>
            <Button variant="ghost" size="sm">Sign Out</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Extracted Leads</h1>
          <Button onClick={handleExportCSV} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Extracted</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4">{lead.name}</td>
                    <td className="px-4 py-4">{lead.title}</td>
                    <td className="px-4 py-4">{lead.company}</td>
                    <td className="px-4 py-4">{lead.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{lead.extractedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
