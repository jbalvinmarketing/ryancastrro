import { useState, useEffect, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Shield, Truck, RotateCcw, Loader2 } from "lucide-react";
import { fetchProductByHandle, createShopifyCartForBuyNow } from "@/lib/shopify";
import { toast } from "sonner";

interface ProductImage {
  url: string;
  altText: string | null;
}

interface ProductVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface ProductData {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  handle: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: ProductImage }> };
  variants: { edges: Array<{ node: ProductVariant }> };
  options: Array<{ name: string; values: string[] }>;
}

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"description" | "details">("description");
  const [desktopImageIndex, setDesktopImageIndex] = useState(0);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);
  const [buyingNow, setBuyingNow] = useState(false);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    fetchProductByHandle(handle)
      .then((data) => {
        if (data) {
          setProduct(data);
          const firstVariant = data.variants.edges[0]?.node;
          if (firstVariant) {
            setSelectedVariant(firstVariant);
            const opts: Record<string, string> = {};
            firstVariant.selectedOptions.forEach((o: { name: string; value: string }) => {
              opts[o.name] = o.value;
            });
            setSelectedOptions(opts);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [handle]);

  useEffect(() => {
    if (!product) return;
    const match = product.variants.edges.find((v) =>
      v.node.selectedOptions.every((o) => selectedOptions[o.name] === o.value)
    );
    if (match) setSelectedVariant(match.node);
  }, [selectedOptions, product]);

  // Desktop: track scroll for active thumbnail
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      let closest = 0;
      let minDist = Infinity;
      imageRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const dist = Math.abs(rect.top - containerRect.top);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setDesktopImageIndex(closest);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [product]);

  // Mobile: track horizontal scroll for dots
  const handleMobileScroll = useCallback(() => {
    const el = mobileCarouselRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const width = el.clientWidth;
    const index = Math.round(scrollLeft / width);
    setMobileImageIndex(index);
  }, []);

  useEffect(() => {
    const el = mobileCarouselRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleMobileScroll);
    return () => el.removeEventListener("scroll", handleMobileScroll);
  }, [handleMobileScroll, product]);

  const scrollToImage = (index: number) => {
    imageRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    setBuyingNow(true);
    try {
      const result = await createShopifyCartForBuyNow(selectedVariant.id, 1);
      if (result?.checkoutUrl) {
        window.open(result.checkoutUrl, '_blank');
      } else {
        toast.error("No se pudo iniciar el checkout");
      }
    } catch {
      toast.error("Error al procesar la compra");
    } finally {
      setBuyingNow(false);
    }
  };

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const images = product?.images.edges.map((e) => e.node) || [];
  const price = selectedVariant?.price || product?.priceRange.minVariantPrice;
  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency }).format(parseFloat(amount));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Producto no encontrado</p>
        <button onClick={() => navigate("/")} className="text-sm text-primary underline">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Back button - mobile: top-left with bg, desktop: clean */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-3 left-3 z-50 flex items-center gap-1.5 text-sm text-foreground lg:text-muted-foreground hover:text-foreground transition-colors bg-background/70 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none rounded-full px-3 py-2 lg:px-0 lg:py-0 lg:top-4 lg:left-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs lg:text-sm">Volver</span>
      </button>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Carousel */}
        <div
          ref={mobileCarouselRef}
          className="w-full overflow-x-auto snap-x snap-mandatory flex scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="min-w-full snap-center aspect-[4/5] bg-secondary/10 flex-shrink-0 flex items-center justify-center overflow-hidden"
            >
              <img
                src={img.url}
                alt={img.altText || product.title}
                className="w-full h-full object-contain animate-float p-4"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 py-3">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === mobileImageIndex ? "bg-foreground w-4" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}

        {/* Mobile product info */}
        <div className="px-4 pb-10 pt-2">
          <ProductInfo
            product={product}
            price={price}
            formatPrice={formatPrice}
            selectedVariant={selectedVariant}
            selectedOptions={selectedOptions}
            onOptionChange={handleOptionChange}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBuyNow={handleBuyNow}
            buyingNow={buyingNow}
          />
        </div>
      </div>

      {/* Desktop Layout - 3 columns */}
      <div className="hidden lg:grid lg:grid-cols-[64px_1fr_420px] min-h-screen">
        {/* Left: Thumbnails */}
        <div className="sticky top-0 h-screen overflow-y-auto py-4 pl-2 flex flex-col gap-2 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => scrollToImage(i)}
              className={`w-12 h-12 flex-shrink-0 rounded overflow-hidden border-2 transition-colors ${
                desktopImageIndex === i
                  ? "border-foreground"
                  : "border-transparent hover:border-muted-foreground/40"
              }`}
            >
              <img src={img.url} alt={img.altText || ""} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Center: Stacked images */}
        <div ref={scrollContainerRef} className="h-screen overflow-y-auto scrollbar-hide">
          {images.map((img, i) => (
            <div
              key={i}
              ref={(el) => { imageRefs.current[i] = el; }}
              className="w-full bg-secondary/5 flex items-center justify-center py-8"
            >
              <img
                src={img.url}
                alt={img.altText || product.title}
                className="w-full max-w-[600px] mx-auto object-contain animate-float-slow drop-shadow-2xl"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Right: Product info (sticky) */}
        <div className="sticky top-0 h-screen overflow-y-auto p-8 border-l border-border">
          <ProductInfo
            product={product}
            price={price}
            formatPrice={formatPrice}
            selectedVariant={selectedVariant}
            selectedOptions={selectedOptions}
            onOptionChange={handleOptionChange}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBuyNow={handleBuyNow}
            buyingNow={buyingNow}
          />
        </div>
      </div>
    </div>
  );
};

// Extracted product info component
interface ProductInfoProps {
  product: ProductData;
  price: { amount: string; currencyCode: string } | undefined;
  formatPrice: (amount: string, currency: string) => string;
  selectedVariant: ProductVariant | null;
  selectedOptions: Record<string, string>;
  onOptionChange: (name: string, value: string) => void;
  activeTab: "description" | "details";
  setActiveTab: (tab: "description" | "details") => void;
  onBuyNow: () => void;
  buyingNow: boolean;
}

const ProductInfo = ({
  product,
  price,
  formatPrice,
  selectedVariant,
  selectedOptions,
  onOptionChange,
  activeTab,
  setActiveTab,
  onBuyNow,
  buyingNow,
}: ProductInfoProps) => {
  const benefits = [
    { icon: Package, label: "Empaque premium" },
    { icon: Shield, label: "Producto original" },
    { icon: Truck, label: "Envío a toda Colombia" },
    { icon: RotateCcw, label: "Cambios y devoluciones" },
  ];

  return (
    <div className="space-y-5">
      {/* Title & Price */}
      <div>
        <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-1 font-body">
          Ryan Castro Merch
        </p>
        <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
          {product.title}
        </h1>
        {price && (
          <p className="text-base sm:text-lg mt-1.5 text-foreground">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        )}
      </div>

      {/* Options */}
      {product.options
        .filter((opt) => opt.name !== "Title" || opt.values.length > 1)
        .map((option) => (
          <div key={option.name}>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2.5 font-body">
              {option.name}: <span className="text-foreground">{selectedOptions[option.name]}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value;
                return (
                  <button
                    key={value}
                    onClick={() => onOptionChange(option.name, value)}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm border transition-colors ${
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      {/* Add to Cart / Buy Now */}
      <div className="space-y-2.5 pt-1">
        <button
          className="w-full py-3 sm:py-3.5 text-xs sm:text-sm font-medium tracking-wider uppercase border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 active:scale-[0.98]"
          disabled={!selectedVariant?.availableForSale}
        >
          {selectedVariant?.availableForSale ? "AÑADIR AL CARRITO" : "AGOTADO"}
        </button>
        <button
          onClick={onBuyNow}
          disabled={buyingNow || !selectedVariant?.availableForSale}
          className="w-full py-3 sm:py-3.5 text-xs sm:text-sm font-medium tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {buyingNow ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "COMPRAR AHORA"
          )}
        </button>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {benefits.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-t border-border pt-5">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-2.5 px-1 mr-6 text-[10px] tracking-[0.2em] uppercase transition-colors border-b-2 ${
              activeTab === "description"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Descripción
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-2.5 px-1 text-[10px] tracking-[0.2em] uppercase transition-colors border-b-2 ${
              activeTab === "details"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Detalles
          </button>
        </div>
        <div className="pt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
          {activeTab === "description" ? (
            product.description ? (
              <p>{product.description}</p>
            ) : (
              <p className="italic">Sin descripción disponible.</p>
            )
          ) : (
            <ul className="space-y-1.5">
              <li>• Producto oficial Ryan Castro</li>
              <li>• Material premium</li>
              <li>• Edición limitada</li>
              {selectedVariant && selectedVariant.title !== "Default Title" && (
                <li>• Variante: {selectedVariant.title}</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
