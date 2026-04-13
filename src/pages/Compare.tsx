import { useState, useEffect } from "react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { GitCompare, Plus, X, Bed, Bath, Maximize, MapPin, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  property_type: string;
  roi_estimate: number | null;
  rental_yield: number | null;
  amenities: string[] | null;
  images: string[] | null;
}

export default function Compare() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("properties").select("*").limit(50).then(({ data }) => {
      if (data) setProperties(data as Property[]);
    });
  }, []);

  const addProperty = (p: Property) => {
    if (selected.length >= 4) {
      toast({ title: "Maximum 4 properties", description: "Remove one to add another.", variant: "destructive" });
      return;
    }
    if (selected.find((s) => s.id === p.id)) return;
    setSelected([...selected, p]);
    setShowPicker(false);
  };

  const removeProperty = (id: string) => setSelected(selected.filter((s) => s.id !== id));

  const fmt = (n: number) => new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(n);

  const rows = [
    { label: "Price", render: (p: Property) => fmt(p.price) },
    { label: "Type", render: (p: Property) => p.property_type },
    { label: "Bedrooms", render: (p: Property) => p.bedrooms ?? "—", icon: <Bed className="h-4 w-4" /> },
    { label: "Bathrooms", render: (p: Property) => p.bathrooms ?? "—", icon: <Bath className="h-4 w-4" /> },
    { label: "Area (sqft)", render: (p: Property) => p.area ? p.area.toLocaleString() : "—", icon: <Maximize className="h-4 w-4" /> },
    { label: "Price/sqft", render: (p: Property) => p.area ? fmt(p.price / p.area) : "—" },
    { label: "Est. ROI", render: (p: Property) => p.roi_estimate ? `${p.roi_estimate}%` : "—", icon: <TrendingUp className="h-4 w-4" /> },
    { label: "Rental Yield", render: (p: Property) => p.rental_yield ? `${p.rental_yield}%` : "—" },
    { label: "Location", render: (p: Property) => p.location, icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <Layout>
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={[{ label: "Compare" }]} />
          <div className="flex items-center gap-3 mb-8">
            <GitCompare className="h-8 w-8 text-gold" />
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Compare Properties</h1>
              <p className="text-muted-foreground">Side-by-side comparison of up to 4 properties</p>
            </div>
          </div>

          {selected.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl">
              <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No properties selected</h2>
              <p className="text-muted-foreground mb-6">Add properties to start comparing</p>
              <Button variant="gold" onClick={() => setShowPicker(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Property
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-4 bg-secondary rounded-tl-xl min-w-[150px]">Feature</th>
                      {selected.map((p) => (
                        <th key={p.id} className="p-4 bg-secondary min-w-[220px]">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-left">
                              <p className="font-semibold text-foreground text-sm">{p.title}</p>
                              <p className="text-xs text-muted-foreground">{p.location}</p>
                            </div>
                            <button onClick={() => removeProperty(p.id)} className="text-muted-foreground hover:text-destructive">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </th>
                      ))}
                      {selected.length < 4 && (
                        <th className="p-4 bg-secondary rounded-tr-xl min-w-[180px]">
                          <Button variant="outline" size="sm" onClick={() => setShowPicker(true)}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? "bg-card" : "bg-secondary/50"}>
                        <td className="p-4 font-medium text-sm text-foreground flex items-center gap-2">
                          {row.icon} {row.label}
                        </td>
                        {selected.map((p) => (
                          <td key={p.id} className="p-4 text-sm text-foreground">{row.render(p)}</td>
                        ))}
                        {selected.length < 4 && <td className="p-4" />}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Property Picker Modal */}
          {showPicker && (
            <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setShowPicker(false)}>
              <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[70vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-display text-xl font-bold mb-4">Select a Property</h3>
                <div className="space-y-2">
                  {properties.filter((p) => !selected.find((s) => s.id === p.id)).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addProperty(p)}
                      className="w-full text-left p-4 rounded-xl border border-border hover:bg-secondary transition-colors"
                    >
                      <p className="font-medium text-foreground">{p.title}</p>
                      <p className="text-sm text-muted-foreground">{p.location} · {fmt(p.price)}</p>
                    </button>
                  ))}
                  {properties.filter((p) => !selected.find((s) => s.id === p.id)).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No more properties available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
