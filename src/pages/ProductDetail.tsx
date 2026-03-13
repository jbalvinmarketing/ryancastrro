import { useState, useEffect, useRef } from "react";
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [buyingNow, setBuyingNow] = useState(false);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Update selected variant when options change
  useEffect(() => {
    if (!product) return;
    const match = product.variants.edges.find((v) =>
      v.node.selectedOptions.every(
        (o) => selectedOptions[o.name] === o.value
      )
    );
    if (match) setSelectedVariant(match.node);
  }, [selectedOptions, product]);

  // Track scroll position for active thumbnail
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
      setActiveImageIndex(closest);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [product]);

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
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Volver</span>
      </button>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Carousel */}
        <div className="w-full overflow-x-auto snap-x snap-mandatory flex">
          {images.map((img, i) => (
            <div
              key={i}
              className="min-w-full snap-center aspect-[4/5] bg-secondary/10 flex-shrink-0"
            >
              <img
                src={img.url}
                alt={img.altText || product.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 py-3">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === activeImageIndex ? "bg-foreground" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        {/* Mobile product info */}
        <div className="px-4 pb-8">
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
                activeImageIndex === i
                  ? "border-foreground"
                  : "border-transparent hover:border-muted-foreground/40"
              }`}
            >
              <img
                src={img.url}
                alt={img.altText || ""}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Center: Stacked images */}
        <div
          ref={scrollContainerRef}
          className="h-screen overflow-y-auto scrollbar-hide"
        >
          {images.map((img, i) => (
            <div
              key={i}
              ref={(el) => { imageRefs.current[i] = el; }}
              className="w-full bg-secondary/5"
            >
              <img
                src={img.url}
                alt={img.altText || product.title}
                className="w-full object-contain"
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
    <div className="space-y-6">
      {/* Title & Price */}
      <div>
        <p className="text-xs text-muted-foreground tracking-widest uppercase mb-1 font-body">
          Ryan Castro Merch
        </p>
        <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">
          {product.title}
        </h1>
        {price && (
          <p className="text-lg mt-2 text-foreground">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        )}
      </div>

      {/* Options */}
      {product.options
        .filter((opt) => opt.name !== "Title" || opt.values.length > 1)
        .map((option) => (
          <div key={option.name}>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3 font-body">
              {option.name}: <span className="text-foreground">{selectedOptions[option.name]}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value;
                return (
                  <button
                    key={value}
                    onClick={() => onOptionChange(option.name, value)}
                    className={`px-4 py-2 text-sm border transition-colors ${
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
      <div className="space-y-3 pt-2">
        <button
          className="w-full py-3.5 text-sm font-medium tracking-wider uppercase border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
          disabled={!selectedVariant?.availableForSale}
        >
          {selectedVariant?.availableForSale ? "AÑADIR AL CARRITO" : "AGOTADO"}
        </button>
        <button
          onClick={onBuyNow}
          disabled={buyingNow || !selectedVariant?.availableForSale}
          className="w-full py-3.5 text-sm font-medium tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {buyingNow ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "COMPRAR AHORA"
          )}
        </button>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {benefits.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-t border-border pt-6">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3 px-1 mr-6 text-xs tracking-widest uppercase transition-colors border-b-2 ${
              activeTab === "description"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Descripción
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 px-1 text-xs tracking-widest uppercase transition-colors border-b-2 ${
              activeTab === "details"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Detalles
          </button>
        </div>
        <div className="pt-4 text-sm text-muted-foreground leading-relaxed font-body">
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
              {selectedVariant && (
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
