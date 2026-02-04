import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image, Video, Loader2, Plus } from 'lucide-react';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  name: string;
}

interface ProductMediaUploadProps {
  mediaUrls: MediaItem[];
  onMediaChange: (media: MediaItem[]) => void;
  maxFiles?: number;
}

export function ProductMediaUpload({ 
  mediaUrls, 
  onMediaChange, 
  maxFiles = 10 
}: ProductMediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const remainingSlots = maxFiles - mediaUrls.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'Limite atingido',
        description: `Você pode adicionar no máximo ${maxFiles} arquivos.`,
        variant: 'destructive',
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          throw new Error(`Tipo de arquivo não suportado: ${file.name}`);
        }

        // Validate file size (50MB max)
        if (file.size > 52428800) {
          throw new Error(`Arquivo muito grande: ${file.name} (máx 50MB)`);
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('product-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-media')
          .getPublicUrl(filePath);

        return {
          url: publicUrl,
          type: isImage ? 'image' : 'video',
          name: file.name,
        } as MediaItem;
      });

      const newMedia = await Promise.all(uploadPromises);
      onMediaChange([...mediaUrls, ...newMedia]);

      toast({
        title: 'Sucesso',
        description: `${newMedia.length} arquivo(s) enviado(s) com sucesso.`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro no upload',
        description: error.message || 'Erro ao enviar arquivos.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (index: number) => {
    const mediaToRemove = mediaUrls[index];
    
    // Extract file path from URL
    try {
      const url = new URL(mediaToRemove.url);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // products/filename.ext
      
      // Try to delete from storage
      await supabase.storage
        .from('product-media')
        .remove([filePath]);
    } catch (error) {
      console.log('Could not delete from storage:', error);
    }

    const newMedia = mediaUrls.filter((_, i) => i !== index);
    onMediaChange(newMedia);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Imagens e Vídeos ({mediaUrls.length}/{maxFiles})
        </label>
        <span className="text-xs text-muted-foreground">
          Arraste ou clique para adicionar
        </span>
      </div>

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${dragActive 
            ? 'border-accent bg-accent/5 scale-[1.02]' 
            : 'border-border hover:border-accent/50 hover:bg-secondary/30'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Enviando arquivos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-accent/10">
              <Upload className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Clique ou arraste arquivos aqui
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, GIF, WEBP, MP4, WEBM (máx 50MB cada)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Media Preview Grid */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {mediaUrls.map((media, index) => (
            <div 
              key={index} 
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary/30"
            >
              {media.type === 'image' ? (
                <img
                  src={media.url}
                  alt={media.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-foreground/5">
                  <Video className="h-8 w-8 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground truncate px-2 max-w-full">
                    {media.name}
                  </span>
                </div>
              )}
              
              {/* Badge */}
              <div className="absolute top-2 left-2">
                <span className={`
                  px-2 py-0.5 rounded text-[10px] font-medium
                  ${media.type === 'image' 
                    ? 'bg-blue-500/90 text-white' 
                    : 'bg-purple-500/90 text-white'
                  }
                `}>
                  {media.type === 'image' ? 'IMG' : 'VID'}
                </span>
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              >
                <X className="h-3 w-3" />
              </button>

              {/* Index Badge */}
              <div className="absolute bottom-2 right-2">
                <span className="px-2 py-0.5 rounded bg-foreground/80 text-background text-[10px] font-bold">
                  {index + 1}
                </span>
              </div>
            </div>
          ))}

          {/* Add More Button */}
          {mediaUrls.length < maxFiles && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/50 flex flex-col items-center justify-center gap-2 transition-all hover:bg-secondary/30"
            >
              <Plus className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Adicionar</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
