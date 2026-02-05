import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image, Video, Loader2, Plus, AlertCircle } from 'lucide-react';

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
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      return { valid: false, error: `Tipo de arquivo não suportado: ${file.name}` };
    }

    // Validate file size (50MB max)
    const maxSize = 52428800; // 50MB in bytes
    if (file.size > maxSize) {
      return { valid: false, error: `Arquivo muito grande: ${file.name} (máx 50MB)` };
    }

    // Validate image formats
    if (isImage) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validImageTypes.includes(file.type)) {
        return { valid: false, error: `Formato de imagem não suportado: ${file.name}` };
      }
    }

    // Validate video formats
    if (isVideo) {
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!validVideoTypes.includes(file.type)) {
        return { valid: false, error: `Formato de vídeo não suportado: ${file.name}` };
      }
    }

    return { valid: true };
  };

  const uploadSingleFile = async (file: File): Promise<MediaItem> => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `products/${fileName}`;

    setUploadProgress(`Enviando ${file.name}...`);

    // Upload to Supabase Storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('product-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Erro ao enviar ${file.name}: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-media')
      .getPublicUrl(filePath);

    // Verify the URL is accessible
    if (!publicUrl) {
      throw new Error(`Não foi possível gerar URL pública para ${file.name}`);
    }

    return {
      url: publicUrl,
      type: isImage ? 'image' : 'video',
      name: file.name,
    };
  };

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
    setUploadProgress('Preparando upload...');

    const successfulUploads: MediaItem[] = [];
    const errors: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      try {
        const mediaItem = await uploadSingleFile(file);
        successfulUploads.push(mediaItem);
        setUploadProgress(`Enviado ${i + 1}/${filesToUpload.length}`);
      } catch (error: any) {
        console.error(`Error uploading ${file.name}:`, error);
        errors.push(error.message || `Erro ao enviar ${file.name}`);
      }
    }

    setUploading(false);
    setUploadProgress('');

    // Update media list with successful uploads
    if (successfulUploads.length > 0) {
      onMediaChange([...mediaUrls, ...successfulUploads]);
      
      toast({
        title: 'Sucesso',
        description: `${successfulUploads.length} arquivo(s) enviado(s) com sucesso.`,
      });
    }

    // Show errors if any
    if (errors.length > 0) {
      toast({
        title: 'Alguns arquivos falharam',
        description: errors.slice(0, 3).join('. ') + (errors.length > 3 ? '...' : ''),
        variant: 'destructive',
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (index: number) => {
    const mediaToRemove = mediaUrls[index];
    
    // Extract file path from URL and try to delete from storage
    try {
      const url = new URL(mediaToRemove.url);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // products/filename.ext
      
      await supabase.storage
        .from('product-media')
        .remove([filePath]);
    } catch (error) {
      console.log('Could not delete from storage:', error);
      // Continue anyway - the file might not exist or path might be wrong
    }

    const newMedia = mediaUrls.filter((_, i) => i !== index);
    onMediaChange(newMedia);

    toast({
      title: 'Removido',
      description: 'Arquivo removido com sucesso.',
    });
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
          {uploading ? uploadProgress : 'Arraste ou clique para adicionar'}
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
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground font-medium">{uploadProgress}</p>
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

      {/* Important Notice */}
      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-600 dark:text-blue-400">
          <strong>Importante:</strong> Aguarde até que todos os arquivos sejam enviados antes de salvar o produto.
          A primeira imagem será usada como foto principal.
        </p>
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
                  loading="lazy"
                  onError={(e) => {
                    console.error('Error loading image:', media.url);
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" fill="%23999" font-size="12"%3EErro%3C/text%3E%3C/svg%3E';
                  }}
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

              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/90 text-white">
                    PRINCIPAL
                  </span>
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                disabled={uploading}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
          {mediaUrls.length < maxFiles && !uploading && (
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