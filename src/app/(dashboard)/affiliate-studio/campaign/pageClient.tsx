"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Package,
  Settings,
  Sparkles,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  Link as LinkIcon,
  Loader2,
  Image,
  FileText,
  Hash,
  Megaphone,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Step = 1 | 2 | 3 | 4;

const CAMPAIGN_TYPES = [
  { id: "product_review", label: "Product Review" },
  { id: "tutorial", label: "Tutorial" },
  { id: "comparison", label: "Comparison" },
  { id: "unboxing", label: "Unboxing" },
  { id: "promotion", label: "Promotion" },
  { id: "testimonial", label: "Testimonial" },
];

const PLATFORMS = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
  { id: "twitter", label: "X (Twitter)" },
  { id: "linkedin", label: "LinkedIn" },
];

export function CampaignBuilderPageClient() {
  const { t } = useLocalizationContext();
  const router = useRouter();
  const [step, setStep] = React.useState<Step>(1);
  const [saving, setSaving] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);

  const [selectedProduct, setSelectedProduct] = React.useState<string>("");
  const [newProductUrl, setNewProductUrl] = React.useState("");
  const [campaignName, setCampaignName] = React.useState("");
  const [campaignType, setCampaignType] = React.useState("product_review");
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([]);
  const [brandKit, setBrandKit] = React.useState({ primaryColor: "", secondaryColor: "", font: "" });
  const [generatedContent, setGeneratedContent] = React.useState<any>(null);

  const { data: productsData, isLoading: productsLoading } = useSWR("/api/affiliate/products", fetcher);
  const products = productsData?.data ?? [];

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/affiliate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct || undefined,
          productUrl: newProductUrl || undefined,
          campaignName,
          campaignType,
          platforms: selectedPlatforms,
          brandKit,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setGeneratedContent(result.data);
        toast.success(t("affiliateStudio.contentGenerated"));
        setStep(4);
      } else {
        toast.error(t("affiliateStudio.generationFailed"));
      }
    } catch {
      toast.error(t("affiliateStudio.generationFailed"));
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/affiliate/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          type: campaignType,
          platforms: selectedPlatforms,
          productId: selectedProduct || undefined,
          productUrl: newProductUrl || undefined,
          brandKit,
          content: generatedContent,
        }),
      });
      if (res.ok) {
        toast.success(t("affiliateStudio.campaignCreated"));
        router.push("/affiliate-studio");
      }
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { id: 1, label: t("affiliateStudio.products"), icon: Package },
    { id: 2, label: t("affiliateStudio.settings"), icon: Settings },
    { id: 3, label: t("affiliateStudio.generateAll"), icon: Sparkles },
    { id: 4, label: t("common.done"), icon: CheckCircle },
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = step === s.id;
        const isCompleted = step > s.id;
        return (
          <React.Fragment key={s.id}>
            {i > 0 && <div className="flex-1 h-px bg-border" />}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : isCompleted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              <Icon className="size-4" />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <DashboardCard title={t("affiliateStudio.products")}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("affiliateStudio.productUrl")}</p>
        <div className="space-y-3">
          {productsLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : products.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {products.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => { setSelectedProduct(product.id); setNewProductUrl(""); }}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${selectedProduct === product.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
                >
                  <Package className="size-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.brand || product.category}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
          <div className="border-t border-border pt-4">
            <label className="text-sm font-medium mb-1.5 block">{t("affiliateStudio.importProduct")}</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={newProductUrl}
                onChange={(e) => { setNewProductUrl(e.target.value); setSelectedProduct(""); }}
                placeholder="https://..."
                className="pl-9"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => setStep(2)} disabled={!selectedProduct && !newProductUrl}>
            {t("common.next")}<ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </DashboardCard>
  );

  const renderStep2 = () => (
    <DashboardCard title={t("affiliateStudio.settings")}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("affiliateStudio.campaigns")}</label>
          <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder={t("affiliateStudio.campaigns")} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("affiliateStudio.campaignType")}</label>
          <div className="grid gap-2 sm:grid-cols-3">
            {CAMPAIGN_TYPES.map((ct) => (
              <button
                key={ct.id}
                onClick={() => setCampaignType(ct.id)}
                className={`rounded-lg border p-3 text-sm font-medium text-left transition-colors ${campaignType === ct.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/40"}`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("affiliateStudio.targetPlatforms")}</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${selectedPlatforms.includes(p.id) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("affiliateStudio.brandKit")}</label>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Primary Color</label>
              <Input value={brandKit.primaryColor} onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })} placeholder="#FF6B35" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Secondary Color</label>
              <Input value={brandKit.secondaryColor} onChange={(e) => setBrandKit({ ...brandKit, secondaryColor: e.target.value })} placeholder="#1A1A2E" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Font</label>
              <Input value={brandKit.font} onChange={(e) => setBrandKit({ ...brandKit, font: e.target.value })} placeholder="Inter" />
            </div>
          </div>
        </div>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="mr-2 size-4" />{t("common.back")}</Button>
          <Button onClick={() => setStep(3)} disabled={!campaignName || selectedPlatforms.length === 0}>
            {t("common.next")}<ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </DashboardCard>
  );

  const renderStep3 = () => (
    <DashboardCard title={t("affiliateStudio.generateAll")}>
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Megaphone className="size-4 text-muted-foreground" />
            <span className="font-medium">{campaignName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="size-4" />
            <span>{selectedProduct ? products.find((p: any) => p.id === selectedProduct)?.name : newProductUrl}</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {selectedPlatforms.map((p) => (
              <Badge key={p} tone="info">{p}</Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: FileText, label: t("affiliateStudio.scripts") },
            { icon: Hash, label: "Captions & Hashtags" },
            { icon: Image, label: t("affiliateStudio.thumbnails") },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <item.icon className="size-5 text-primary" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="mr-2 size-4" />{t("common.back")}</Button>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
            {generating ? t("affiliateStudio.generatingContent") : t("affiliateStudio.generateAll")}
          </Button>
        </div>
      </div>
    </DashboardCard>
  );

  const renderStep4 = () => (
    <DashboardCard title={t("common.done")}>
      <div className="space-y-4">
        {generatedContent ? (
          <div className="space-y-4">
            {generatedContent.hooks && (
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <h4 className="font-medium mb-2">{t("affiliateStudio.scripts")}</h4>
                <div className="space-y-2">
                  {(Array.isArray(generatedContent.hooks) ? generatedContent.hooks : [generatedContent.hooks]).map((hook: string, i: number) => (
                    <p key={i} className="text-sm text-muted-foreground">{hook}</p>
                  ))}
                </div>
              </div>
            )}
            {generatedContent.captions && (
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <h4 className="font-medium mb-2">Captions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{generatedContent.captions}</p>
              </div>
            )}
            {generatedContent.hashtags && (
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <h4 className="font-medium mb-2">Hashtags</h4>
                <p className="text-sm text-muted-foreground">{generatedContent.hashtags}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="size-10 text-primary mb-3" />
            <p className="text-sm text-muted-foreground">{t("affiliateStudio.contentGenerated")}</p>
          </div>
        )}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setStep(3)}><ChevronLeft className="mr-2 size-4" />{t("common.back")}</Button>
          <Button onClick={handlePublish} disabled={saving}>
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {saving ? t("common.submitting") : t("affiliateStudio.publishCampaign")}
          </Button>
        </div>
      </div>
    </DashboardCard>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("affiliateStudio.newCampaign")}
        description={t("affiliateStudio.description")}
        actions={
          <Button variant="ghost" onClick={() => router.push("/affiliate-studio")}>{t("common.close")}</Button>
        }
      />

      {renderStepIndicator()}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
}
