import { useState } from "react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Loader2, Upload, X, ImageIcon } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PropertyType = Database["public"]["Enums"]["property_type"];
const propertyTypes: PropertyType[] = ["apartment", "villa", "townhouse", "penthouse", "studio", "land", "commercial", "office"];

export default function SubmitListing() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", property_type: "" as PropertyType, price: "",
    location: "", city: "", address: "", bedrooms: "", bathrooms: "", area: "",
    amenities: "",
  });

  if (!user) {
    return (
      <Layout>
        <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
            <p className="text-muted-foreground mb-4">You need to be signed in to submit a listing.</p>
            <Button variant="gold" onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 10) {
      toast({ title: "Too many images", description: "Maximum 10 images allowed.", variant: "destructive" });
      return;
    }
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024 && f.type.startsWith("image/"));
    if (validFiles.length < files.length) {
      toast({ title: "Some files skipped", description: "Only images under 5MB are accepted.", variant: "destructive" });
    }
    setImageFiles(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("property-images").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("property-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.property_type || !form.price || !form.location) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);

    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      setUploading(true);
      imageUrls = await uploadImages();
      setUploading(false);
    }

    let agent_id = null;
    let developer_id = null;
    if (profile?.role === "agent") {
      const { data } = await supabase.from("agents").select("id").eq("user_id", user.id).single();
      agent_id = data?.id;
    } else if (profile?.role === "developer") {
      const { data } = await supabase.from("developers").select("id").eq("user_id", user.id).single();
      developer_id = data?.id;
    }

    const { error } = await supabase.from("properties").insert([{
      title: form.title,
      description: form.description || null,
      property_type: form.property_type,
      price: Number(form.price),
      location: form.location,
      city: form.city || null,
      address: form.address || null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      area: form.area ? Number(form.area) : null,
      amenities: form.amenities ? form.amenities.split(",").map((a) => a.trim()) : null,
      images: imageUrls.length > 0 ? imageUrls : null,
      agent_id,
      developer_id,
    }]);

    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing submitted!", description: "Your property is now live." });
      navigate("/properties");
    }
  };

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  return (
    <Layout>
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <BreadcrumbNav items={[{ label: "Submit Listing" }]} />
          <div className="flex items-center gap-3 mb-8">
            <PlusCircle className="h-8 w-8 text-gold" />
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Submit Listing</h1>
              <p className="text-muted-foreground">Add a new property to PrimeX Estate</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Luxury 3BR Apartment" />
              </div>
              <div>
                <Label>Property Type *</Label>
                <Select value={form.property_type} onValueChange={(v) => update("property_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the property..." rows={4} />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Price (AED) *</Label>
                <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="1500000" />
              </div>
              <div>
                <Label>Location *</Label>
                <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Dubai Marina" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Dubai" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Bedrooms</Label>
                <Input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <Input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
              </div>
              <div>
                <Label>Area (sqft)</Label>
                <Input type="number" value={form.area} onChange={(e) => update("area", e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Tower A, Floor 25" />
            </div>

            <div>
              <Label>Amenities (comma-separated)</Label>
              <Input value={form.amenities} onChange={(e) => update("amenities", e.target.value)} placeholder="Pool, Gym, Parking" />
            </div>

            {/* Image Upload */}
            <div>
              <Label>Property Photos (max 10)</Label>
              <div className="mt-2">
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Click to upload photos</span>
                  </div>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WebP · Max 5MB each</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              </div>
            </div>

            <Button type="submit" variant="gold" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {uploading ? "Uploading images..." : "Submitting..."}
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Submit Listing
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
