'use client';
import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Dialog, DialogContent, DialogHeader, DialogTitle } from '@traffic2u/ui';
import { QrCode, Plus, Eye, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const menus = [
    { id: '1', name: 'Main Menu', items: 42, views: 1234, lastUpdated: '2024-03-15' },
    { id: '2', name: 'Drinks Menu', items: 28, views: 892, lastUpdated: '2024-03-10' },
  ];

  const handleViewQRCode = async (menu: any) => {
    setSelectedMenu(menu);
    setQrModalOpen(true);
    setLoading(true);

    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuId: menu.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      setQrCodeData(data.qrCode);
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR code');
      setQrModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQRCode = async () => {
    if (!selectedMenu) return;

    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuId: selectedMenu.id, download: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to download QR code');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedMenu.name.toLowerCase().replace(/\s+/g, '-')}-qr-code.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('QR code downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download QR code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="h-6 w-6 text-red-600" />
            <span className="text-xl font-bold">MenuQR</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">Menus</Button>
            <Button variant="ghost" size="sm">Settings</Button>
            <Button variant="ghost" size="sm">Sign Out</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Menus</h1>
          <Button><Plus className="mr-2 h-4 w-4" />New Menu</Button>
        </div>

        <div className="grid gap-6">
          {menus.map(menu => (
            <Card key={menu.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{menu.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{menu.items} items • Updated {menu.lastUpdated}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="success"><Eye className="h-3 w-3 mr-1" />{menu.views} views</Badge>
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewQRCode(menu)}>
                      <QrCode className="h-4 w-4 mr-1" />
                      QR Code
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code - {selectedMenu?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-red-600" />
              </div>
            ) : (
              <>
                {qrCodeData && (
                  <img
                    src={qrCodeData}
                    alt="Menu QR Code"
                    className="w-64 h-64 border-4 border-gray-200 rounded-lg"
                  />
                )}
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR code to view the menu
                </p>
                <Button onClick={handleDownloadQRCode} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download High-Res QR Code
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Perfect for printing table tents, stickers, and posters
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
