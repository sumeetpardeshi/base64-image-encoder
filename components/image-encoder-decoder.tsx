'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, RotateCcw, Image as ImageIcon, Copy, Sidebar, Github } from 'lucide-react'
import { ModeToggle } from './mode-toggle'

interface HistoryItem {
  id: string
  image: string
  encodedText: string
  timestamp: number
  name: string
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a href="/" className="mr-6 flex items-center space-x-2 ml-6">
            <ImageIcon className="h-6 w-6" />
            <span className="font-bold">Image Encoder</span>
          </a>
        </div>
        {/* <div className="flex items-center space-x-6 text-sm font-medium">
          <a href="#encoder" className="transition-colors hover:text-foreground/80">
            Encoder
          </a>
          <a href="#history" className="transition-colors hover:text-foreground/80">
            History
          </a>
          <a href="#examples" className="transition-colors hover:text-foreground/80">
            Examples
          </a>
        </div> */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <a
              href="https://github.com/yourusername/your-repo"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </a>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}

export function ImageEncoderDecoder() {
  const [image, setImage] = useState<string | null>(null)
  const [encodedText, setEncodedText] = useState('')
  const [isEncodeMode, setIsEncodeMode] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputUrl, setInputUrl] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem('imageEncoderHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const saveToHistory = (imageData: string, encodedData: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      image: imageData,
      encodedText: encodedData,
      timestamp: Date.now(),
      name: fileInputRef.current?.files?.[0]?.name || 'Untitled Image'
    }
    
    const updatedHistory = [newItem, ...history].slice(0, 20) // Keep last 20 items
    setHistory(updatedHistory)
    localStorage.setItem('imageEncoderHistory', JSON.stringify(updatedHistory))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImage(result)
        const base64Data = result.split(',')[1]
        setEncodedText(base64Data)
        saveToHistory(result, base64Data)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value
    setInputUrl(url)
    setImage(url)
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          const base64Data = result.split(',')[1]
          setEncodedText(base64Data)
          saveToHistory(result, base64Data)
        }
        reader.readAsDataURL(blob)
      })
  }

  const handleEncodedTextInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEncodedText(event.target.value)
    setImage(`data:image/png;base64,${event.target.value}`)
  }

  const toggleMode = () => {
    setIsEncodeMode(!isEncodeMode)
    setImage(null)
    setEncodedText('')
  }

  const handleCopyClick = () => {
    navigator.clipboard.writeText(encodedText)
  }

  const getBase64Size = (base64String: string): number => {
    const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0
    return (base64String.length * 0.75) - padding
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6 h-[90vh]">
          {/* Main encoder card - 80% width on large screens */}
          <Card className="w-full lg:w-4/5 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{isEncodeMode ? 'Base64 Image Encoder' : 'Image Decoder'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <Tabs defaultValue={isEncodeMode ? "upload" : "paste"} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" disabled={!isEncodeMode}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="url" disabled={!isEncodeMode}>
                    <Link className="h-4 w-4 mr-2" />
                    URL
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full  border-2 border-dashed rounded-lg cursor-pointer bg-ruby-50 border-ruby-300 hover:bg-ruby-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-ruby-500" />
                        <p className="mb-2 text-sm text-ruby-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-ruby-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                      </div>
                      <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} ref={fileInputRef} accept="image/*" />
                    </label>
                  </div>
                </TabsContent>
                <TabsContent value="url">
                  <Input 
                    type="url" 
                    placeholder="Enter image URL" 
                    onChange={handleUrlInput} 
                    value={inputUrl} 
                    className="mb-4" 
                  />
                </TabsContent>
                <TabsContent value="paste">
                  <Textarea 
                    placeholder="Paste base64 encoded image data here" 
                    value={encodedText} 
                    onChange={handleEncodedTextInput}
                    className="min-h-[100px] mb-4"
                  />
                </TabsContent>
              </Tabs>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Original Image</h3>
                  {image && (
                    <div className="border rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt="Original" 
                        className="w-full object-contain max-h-[50vh]" 
                      />
                    </div>
                  )}
                  {!image && (
                    <div className="flex items-center justify-center w-full h-48 bg-ruby-100 rounded-lg">
                      <ImageIcon className="h-12 w-12 text-ruby-300 aspect-video relative overflow-hidden rounded-md mb-2" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex justify-between items-center">
                    Encoded Text
                    <Button variant="ghost" size="icon" onClick={handleCopyClick} title="Copy to clipboard">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </h3>
                  <Textarea 
                    value={encodedText} 
                    readOnly 
                    className="w-full h-48 text-xs"
                    placeholder="Encoded text will appear here"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Card - 20% width on large screens */}
          <Card className="w-full lg:w-1/5 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>History</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setHistory([])
                    localStorage.removeItem('imageEncoderHistory')
                  }}
                >
                  Clear History
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {history.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="aspect-video relative overflow-hidden rounded-md mb-2">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(getBase64Size(item.encodedText))}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setImage(item.image)
                              setEncodedText(item.encodedText)
                            }}
                          >
                            <ImageIcon className="h-4 w-4 mr-1" />
                            Load
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              navigator.clipboard.writeText(item.encodedText)
                            }}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {history.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-4 text-sm text-muted-foreground">No images in history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}