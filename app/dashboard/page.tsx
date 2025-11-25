'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Copy, Download, Heart, Sparkles, Loader2 } from 'lucide-react'
import { copyToClipboard, getPlatformIcon } from '@/lib/utils'

const PLATFORMS = [
  { value: 'INSTAGRAM', label: 'Instagram', icon: '📷' },
  { value: 'FACEBOOK', label: 'Facebook', icon: '👥' },
  { value: 'TWITTER', label: 'Twitter / X', icon: '🐦' },
  { value: 'LINKEDIN', label: 'LinkedIn', icon: '💼' },
  { value: 'TIKTOK', label: 'TikTok', icon: '🎵' },
]

const TONES = [
  'Professional',
  'Casual',
  'Funny',
  'Inspiring',
  'Educational',
  'Promotional',
  'Storytelling',
]

const LENGTHS = [
  { value: 'short', label: 'Short (1-2 sentences)' },
  { value: 'medium', label: 'Medium (2-3 sentences)' },
  { value: 'long', label: 'Long (3-5 sentences)' },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    topic: '',
    platform: 'INSTAGRAM',
    tone: 'Professional',
    length: 'medium',
    includeHashtags: true,
    includeEmojis: true,
    count: 1,
  })
  const [captions, setCaptions] = useState<any[]>([])

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a topic for your caption',
      })
      return
    }

    setIsGenerating(true)
    setCaptions([])

    try {
      const response = await fetch('/api/captions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to generate caption',
        })
        return
      }

      setCaptions(data.captions)
      toast({
        title: 'Success!',
        description: `Generated ${data.captions.length} caption${data.captions.length > 1 ? 's' : ''}`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (content: string) => {
    const success = await copyToClipboard(content)
    if (success) {
      toast({
        title: 'Copied!',
        description: 'Caption copied to clipboard',
      })
    }
  }

  const handleSave = async (captionId: string) => {
    try {
      const response = await fetch('/api/captions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captionId }),
      })

      if (response.ok) {
        toast({
          title: 'Saved!',
          description: 'Caption saved to your library',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save caption',
      })
    }
  }

  const tier = session?.user?.subscriptionTier || 'FREE'
  const maxCount = tier === 'PREMIUM' ? 10 : tier === 'BUILDER' ? 5 : 1

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">AI Caption Generator</h1>
        <p className="text-muted-foreground">
          Create engaging captions for your social media posts in seconds
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Generator Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generate Caption</CardTitle>
            <CardDescription>
              Customize your caption generation settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">What's your post about?</Label>
              <Textarea
                id="topic"
                placeholder="E.g., New product launch, Weekend vibes, Fitness motivation..."
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) =>
                  setFormData({ ...formData, platform: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.icon} {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={formData.tone}
                onValueChange={(value) =>
                  setFormData({ ...formData, tone: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Select
                value={formData.length}
                onValueChange={(value) =>
                  setFormData({ ...formData, length: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LENGTHS.map((length) => (
                    <SelectItem key={length.value} value={length.value}>
                      {length.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {maxCount > 1 && (
              <div className="space-y-2">
                <Label htmlFor="count">Generate Multiple ({maxCount} max)</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max={maxCount}
                  value={formData.count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      count: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hashtags"
                checked={formData.includeHashtags}
                onChange={(e) =>
                  setFormData({ ...formData, includeHashtags: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="hashtags" className="cursor-pointer">
                Include hashtags
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emojis"
                checked={formData.includeEmojis}
                onChange={(e) =>
                  setFormData({ ...formData, includeEmojis: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="emojis" className="cursor-pointer">
                Include emojis
              </Label>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Caption
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Captions */}
        <div className="lg:col-span-2 space-y-4">
          {captions.length === 0 && !isGenerating && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Sparkles className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  No captions generated yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Fill out the form and click "Generate Caption" to get started
                </p>
              </CardContent>
            </Card>
          )}

          {isGenerating && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Generating your captions...
                </p>
              </CardContent>
            </Card>
          )}

          {captions.map((caption, index) => (
            <Card key={caption.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Caption {index + 1}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(caption.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave(caption.id)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted p-4">
                  <p className="whitespace-pre-wrap text-sm">{caption.content}</p>
                </div>
                {caption.hashtags.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                      Hashtags:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {caption.hashtags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
