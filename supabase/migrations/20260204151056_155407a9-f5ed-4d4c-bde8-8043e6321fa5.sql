-- Criar bucket para imagens e vídeos de produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-media', 
  'product-media', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
);

-- Criar política para permitir uploads autenticados
CREATE POLICY "Authenticated users can upload product media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-media');

-- Criar política para permitir visualização pública
CREATE POLICY "Anyone can view product media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-media');

-- Criar política para admin poder deletar
CREATE POLICY "Admins can delete product media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-media' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Criar política para admin poder atualizar
CREATE POLICY "Admins can update product media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-media' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Adicionar coluna para múltiplas imagens e vídeos na tabela products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb;