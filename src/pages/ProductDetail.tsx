import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { storefrontApiRequest, PRODUCT_BY_HANDLE_QUERY, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Loader2, ChevronRight, ChevronLeft, Package, Shield, Truck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import useEmblaCarousel from "embla-carousel-react";

type Tab = "description" | "details";

/* ── Mobile Image Carousel ── */
const MobileImageCarousel = ({ images, title }: { images: Array<{ node: { url: string; altText: string | null } }>; title: string }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrent(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] flex items-center justify-center text-muted-foreground bg-card">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="relative bg-card">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((img, idx) => (
            <div key={idx} className="flex-[0_0_100%] min-w-0">
              <div className="aspect-[4/5]">
                <img
                  src={img.node.url}
                  alt={img.node.altText || title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-full text-foreground transition-opacity opacity-60 hover:opacity-100"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-full text-foreground transition-opacity opacity-60 hover:opacity-100"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === current ? "bg-foreground w-4" : "bg-foreground/30"
              }`}
              aria-label={`Ir a imagen ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Rich Description ── */
const ProductDescription = ({ description, activeTab, setActiveTab, selectedVariant, handle }: {
  description: string;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  selectedVariant: any;
  handle: string;
}) => {
  const features = [
    { icon: Package, text: "Materiales premium seleccionados cuidadosamente" },
    { icon: Shield, text: "Garantía de calidad en cada pieza" },
    { icon: Truck, text: "Envío a todo el país" },
    { icon: RotateCcw, text: "Cambios y devoluciones dentro de 30 días" },
  ];

  return (
    <div className="pt-2 lg:pt-4">
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("description")}
          className={`text-[11px] font-semibold tracking-[0.15em] uppercase pb-3 mr-8 border-b-2 -mb-px transition-colors ${
            activeTab === "description"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground"
          }`}
        >
          DESCRIPCIÓN
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`text-[11px] font-semibold tracking-[0.15em] uppercase pb-3 border-b-2 -mb-px transition-colors ${
            activeTab === "details"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground"
          }`}
        >
          DETALLES
        </button>
      </div>
      <div className="pt-4">
        {activeTab === "description" && (
          <div className="space-y-4">
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {description}
            </p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Diseñado para quienes buscan lo exclusivo. Cada pieza refleja atención al detalle
              y un compromiso con la calidad que se siente desde el primer momento. Ideal para
              elevar tu estilo diario con un toque único y auténtico.
            </p>
            <ul className="space-y-3 pt-2">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <feature.icon className="w-4 h-4 text-foreground flex-shrink-0" />
                  <span className="text-[12px] text-muted-foreground">{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === "details" && (
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {selectedVariant?.selectedOptions.map((opt: any) => (
              <p key={opt.name}>
                <span className="text-foreground">{opt.name}:</span> {opt.value}
              </p>
            ))}
            <p><span className="text-foreground">Handle:</span> {handle}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Variant Selector ── */
const VariantSelector = ({ options, variants, selectedVariant, onSelectVariant }: {
  options: Array<{ name: string; values: string[] }>;
  variants: Array<{ node: any }>;
  selectedVariant: any;
  onSelectVariant: (idx: number) => void;
}) => (
  <>
    {options.map((option) => {
      if (option.name === "Title" && option.values.length === 1 && option.values[0] === "Default Title") return null;
      if (option.name.toLowerCase() === "color" && option.values.length <= 1) return null;
      return (
        <div key={option.name} className="space-y-2">
          {option.name.toLowerCase() !== "color" && (
            <label className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
              {option.name}
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const variantIdx = variants.findIndex(v =>
                v.node.selectedOptions.some((o: any) => o.name === option.name && o.value === value)
              );
              const isSelected = selectedVariant?.selectedOptions.some(
                (o: any) => o.name === option.name && o.value === value
              );
              return (
                <button
                  key={value}
                  onClick={() => variantIdx >= 0 && onSelectVariant(variantIdx)}
                  className={`min-w-[44px] px-3 py-2 lg:px-4 lg:py-2.5 text-[11px] font-medium tracking-wide border transition-all ${
                    isSelected
                      ? "border-foreground text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      );
    })}
  </>
);

/* ── Main Component ── */
const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct["node"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);
  const getCheckoutUrl = useCartStore(state => state.getCheckoutUrl);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
        if (data?.data?.product) setProduct(data.data.product);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    }
    if (handle) fetchProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-background min-h-screen">
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-muted-foreground">Producto no encontrado</p>
          <Link to="/" className="text-accent hover:underline">Volver a la tienda</Link>
        </div>
      </div>
    );
  }

  const selectedVariant = product.variants.edges[selectedVariantIdx]?.node;
  const images = product.images.edges;
  const isAvailable = selectedVariant?.availableForSale ?? false;

  const handleAddToCart = async () => {
    if (!selectedVariant || !isAvailable) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success(`${product.title} agregado al carrito`, { position: "top-center" });
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || !isAvailable) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
  };

  const colorOption = selectedVariant?.selectedOptions.find(
    (o: any) => o.name.toLowerCase() === "color"
  );

  const formatPrice = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return `$${num.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;
  };

  const productInfoContent = (
    <>
      <div>
        <h1 className="font-display text-lg lg:text-xl font-semibold tracking-wide text-foreground uppercase leading-snug">
          {product.title}
        </h1>
        <p className="text-sm text-foreground mt-2 lg:mt-3">
          {formatPrice(selectedVariant?.price.amount || "0", selectedVariant?.price.currencyCode || "")}
        </p>
      </div>

      <hr className="border-border" />

      {colorOption && (
        <p className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
          COLOR: <span className="text-foreground">{colorOption.value.toUpperCase()}</span>
        </p>
      )}

      <VariantSelector
        options={product.options}
        variants={product.variants.edges}
        selectedVariant={selectedVariant}
        onSelectVariant={setSelectedVariantIdx}
      />

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        disabled={isCartLoading || !isAvailable}
        className="w-full py-4 text-[11px] font-semibold tracking-[0.2em] uppercase border border-foreground text-foreground hover:bg-foreground hover:text-background transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isCartLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : !isAvailable ? (
          "AGOTADO"
        ) : (
          "AGREGAR AL CARRITO"
        )}
      </button>

      {/* Buy Now */}
      {isAvailable && (
        <button
          onClick={handleBuyNow}
          disabled={isCartLoading}
          className="w-full py-4 text-[11px] font-semibold tracking-[0.2em] uppercase bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isCartLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            "COMPRAR AHORA"
          )}
        </button>
      )}

      {/* Description */}
      {product.description && (
        <ProductDescription
          description={product.description}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedVariant={selectedVariant}
          handle={product.handle}
        />
      )}
    </>
  );

  return (
    <div className="bg-background min-h-screen">

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden">
        <MobileImageCarousel images={images} title={product.title} />
        <div className="px-4 py-6 space-y-5">
          {productInfoContent}
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:flex max-w-[1400px] mx-auto">
        {/* Thumbnail strip */}
        <div className="flex flex-col gap-1.5 py-4 px-3 w-[60px] flex-shrink-0 sticky top-14 self-start max-h-[calc(100vh-56px)] overflow-y-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`w-[44px] h-[44px] rounded-sm overflow-hidden border transition-all flex-shrink-0 ${
                idx === selectedImage
                  ? "border-foreground opacity-100"
                  : "border-transparent opacity-40 hover:opacity-70"
              }`}
            >
              <img src={img.node.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Main images - stacked */}
        <div className="flex-1 min-w-0">
          {images.length > 0 ? (
            images.map((img, idx) => (
              <div key={idx} className="bg-card border-b border-border last:border-b-0">
                <img
                  src={img.node.url}
                  alt={img.node.altText || product.title}
                  className="w-full object-contain max-h-[85vh] mx-auto"
                />
              </div>
            ))
          ) : (
            <div className="aspect-square flex items-center justify-center text-muted-foreground bg-card">
              Sin imagen
            </div>
          )}
        </div>

        {/* Product info - sticky */}
        <div className="w-[400px] xl:w-[440px] flex-shrink-0 border-l border-border">
          <div className="sticky top-14 p-8 xl:p-10 space-y-5 max-h-[calc(100vh-56px)] overflow-y-auto">
            {productInfoContent}
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      {handle && <RecommendedProducts currentHandle={handle} />}
    </div>
  );
};

export default ProductDetail;
