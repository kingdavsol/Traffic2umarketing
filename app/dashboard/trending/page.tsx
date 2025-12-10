'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Hash, Copy, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { copyToClipboard } from '@/lib/utils'

const PLATFORMS = [
  { value: 'all', label: 'All Platforms' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'TWITTER', label: 'Twitter / X' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'TIKTOK', label: 'TikTok' },
]

export default function TrendingPage() {
  const { toast } = useToast()
  const [memes, setMemes] = useState<any[]>([])
  const [hashtags, setHashtags] = useState<any[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrendingData()
  }, [selectedPlatform])

  const fetchTrendingData = async () => {
    setIsLoading(true)
    try {
      const platformParam = selectedPlatform !== 'all' ? `?platform=${selectedPlatform}` : ''

      const [memesRes, hashtagsRes] = await Promise.all([
        fetch(`/api/trending/memes${platformParam}`),
        fetch(`/api/trending/hashtags${platformParam}`),
      ])

      if (memesRes.ok) {
        const memesData = await memesRes.json()
        setMemes(memesData.memes || [])
      }

      if (hashtagsRes.ok) {
        const hashtagsData = await hashtagsRes.json()
        setHashtags(hashtagsData.hashtags || [])
      }
    } catch (error) {
      console.error('Error fetching trending data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyHashtag = async (hashtag: string) => {
    const success = await copyToClipboard(hashtag)
    if (success) {
      toast({
        title: 'Copied!',
        description: `${hashtag} copied to clipboard`,
      })
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Trending Content</h1>
          <p className="text-muted-foreground">
            Discover trending memes and hashtags to boost your engagement
          </p>
        </div>
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map((platform) => (
              <SelectItem key={platform.value} value={platform.value}>
                {platform.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="memes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="memes">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trending Memes
          </TabsTrigger>
          <TabsTrigger value="hashtags">
            <Hash className="mr-2 h-4 w-4" />
            Top Hashtags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="memes" className="space-y-4">
          {memes.length === 0 && !isLoading && (
            <Card>
              <CardContent className="py-16 text-center">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No trending memes yet</h3>
                <p className="text-sm text-muted-foreground">
                  Check back soon for trending meme ideas
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {memes.map((meme) => (
              <Card key={meme.id}>
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {meme.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      🔥 {meme.popularity}
                    </span>
                  </div>
                  <CardTitle>{meme.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {meme.description}
                  </p>
                  {meme.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={meme.imageUrl}
                        alt={meme.title}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {meme.platform.map((platform: string) => (
                      <span
                        key={platform}
                        className="text-xs text-muted-foreground"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hashtags" className="space-y-4">
          {hashtags.length === 0 && !isLoading && (
            <Card>
              <CardContent className="py-16 text-center">
                <Hash className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No trending hashtags yet</h3>
                <p className="text-sm text-muted-foreground">
                  Check back soon for trending hashtags
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {hashtags.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{item.hashtag}</h3>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {item.platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>🔥 {item.popularity} popularity</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyHashtag(item.hashtag)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
