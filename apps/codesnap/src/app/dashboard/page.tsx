'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@traffic2u/ui';
import { Upload, Sparkles, Copy, Download, Code } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [image, setImage] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [framework, setFramework] = useState<string>('react');
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
  });

  const handleGenerate = async () => {
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          framework,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate code');
      }

      setGeneratedCode(data.code);
      toast.success('Code generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Code copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component.${framework === 'react' ? 'tsx' : 'html'}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">CodeSnap</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">Dashboard</Button>
              <Button variant="ghost" size="sm">History</Button>
              <Button variant="ghost" size="sm">Settings</Button>
              <Button variant="ghost" size="sm">Sign Out</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transform Screenshot to Code</h1>
          <p className="mt-2 text-gray-600">Upload a screenshot and get production-ready code instantly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Screenshot</CardTitle>
                <CardDescription>Drop your UI screenshot here</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  {image ? (
                    <img src={image} alt="Screenshot" className="mx-auto max-h-64 rounded-lg" />
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-4 text-sm text-gray-600">
                        Drag & drop your screenshot here, or click to browse
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        PNG, JPG, JPEG or WEBP (max 10MB)
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Choose your preferred framework</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Framework
                  </label>
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="react">React (JSX/TSX)</option>
                    <option value="vue">Vue</option>
                    <option value="svelte">Svelte</option>
                    <option value="html">HTML/CSS</option>
                    <option value="tailwind">React + Tailwind</option>
                  </select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!image || loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>Generating Code...</>
                  ) : (
                    <>
                      <Code className="mr-2 h-5 w-5" />
                      Generate Code
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Code Output Section */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Generated Code</CardTitle>
                    <CardDescription>Your production-ready code</CardDescription>
                  </div>
                  {generatedCode && (
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedCode ? (
                  <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto text-sm font-mono max-h-[600px] overflow-y-auto">
                    <code>{generatedCode}</code>
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Code className="h-16 w-16 mb-4" />
                    <p className="text-sm">Your generated code will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
