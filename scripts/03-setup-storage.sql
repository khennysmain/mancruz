-- Create storage bucket for complaint/incident images
INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-images', 'complaint-images', true);

-- Create storage policies for complaint images
CREATE POLICY "Anyone can view complaint images" ON storage.objects FOR SELECT USING (bucket_id = 'complaint-images');
CREATE POLICY "Anyone can upload complaint images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'complaint-images');
CREATE POLICY "Admins can delete complaint images" ON storage.objects FOR DELETE USING (bucket_id = 'complaint-images');
