import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { storefrontApiRequest, PRODUCT_BY_HANDLE_QUERY, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import MerchNavbar from "@/components/MerchNavbar";

type Tab = "description" | "details";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct["node"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
        if (data?.data?.product) {
          setProduct(data.data.product);
        }
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
        <MerchNavbar />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-background min-h-screen">
        <MerchNavbar />
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

  const colorOption = selectedVariant?.selectedOptions.find(
    o => o.name.toLowerCase() === "color"
  );

  const formatPrice = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return `$${num.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  return (
    <div className="bg-background min-h-screen">
      <MerchNavbar />

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 pt-16 pb-3">
          <nav className="flex items-center gap-1.5 text-[11px] tracking-wider text-muted-foreground uppercase">
            <Link to="/" className="hover:text-foreground transition-colors">HOME</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate">{product.title.toUpperCase()}</span>
          </nav>
        </div>
      </div>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden">
        {/* Image carousel */}
        <div className="bg-card">
          <div className="aspect-[4/5] relative">
            {images[selectedImage] ? (
              <img
                src={images[selectedImage].node.url}
                alt={images[selectedImage].node.altText || product.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Sin imagen
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-1.5 px-4 pb-4 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-12 h-12 rounded-sm overflow-hidden flex-shrink-0 border transition-all ${
                    idx === selectedImage
                      ? "border-foreground"
                      : "border-border opacity-50"
                  }`}
                >
                  <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info mobile */}
        <div className="px-4 py-6 space-y-5">
          <div>
            <h1 className="font-display text-lg font-semibold tracking-wide text-foreground uppercase leading-snug">
              {product.title}
            </h1>
            <p className="text-sm text-foreground mt-2">
              {formatPrice(selectedVariant?.price.amount || "0", selectedVariant?.price.currencyCode || "")}
            </p>
          </div>

          <hr className="border-border" />

          {colorOption && (
            <p className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
              COLOR: <span className="text-foreground">{colorOption.value.toUpperCase()}</span>
            </p>
          )}

          {/* Variant options */}
          {product.options.map((option) => {
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
                    const variantIdx = product.variants.edges.findIndex(v =>
                      v.node.selectedOptions.some(o => o.name === option.name && o.value === value)
                    );
                    const isSelected = selectedVariant?.selectedOptions.some(
                      o => o.name === option.name && o.value === value
                    );
                    return (
                      <button
                        key={value}
                        onClick={() => variantIdx >= 0 && setSelectedVariantIdx(variantIdx)}
                        className={`min-w-[44px] px-3 py-2 text-[11px] font-medium tracking-wide border transition-all ${
                          isSelected
                            ? "border-foreground text-foreground"
                            : "border-border text-muted-foreground hover:border-foreground"
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

          {/* Add to Cart - outlined style like Kith */}
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

          {/* Description tabs */}
          {product.description && (
            <div className="pt-2">
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
              <div className="pt-4 text-sm text-muted-foreground leading-relaxed">
                {activeTab === "description" && <p>{product.description}</p>}
                {activeTab === "details" && (
                  <div className="space-y-1.5 text-xs">
                    {selectedVariant?.selectedOptions.map((opt) => (
                      <p key={opt.name}>
                        <span className="text-foreground">{opt.name}:</span> {opt.value}
                      </p>
                    ))}
                    <p><span className="text-foreground">Handle:</span> {product.handle}</p>
                  </div>
                )}
              </div>
            </div>
          )}
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

        {/* Main images - stacked, scrollable */}
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
            <div>
              <h1 className="font-display text-xl font-semibold tracking-wide text-foreground uppercase leading-snug">
                {product.title}
              </h1>
              <p className="text-sm text-foreground mt-3">
                {formatPrice(selectedVariant?.price.amount || "0", selectedVariant?.price.currencyCode || "")}
              </p>
            </div>

            <hr className="border-border" />

            {colorOption && (
              <p className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
                COLOR: <span className="text-foreground">{colorOption.value.toUpperCase()}</span>
              </p>
            )}

            {product.options.map((option) => {
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
                      const variantIdx = product.variants.edges.findIndex(v =>
                        v.node.selectedOptions.some(o => o.name === option.name && o.value === value)
                      );
                      const isSelected = selectedVariant?.selectedOptions.some(
                        o => o.name === option.name && o.value === value
                      );
                      return (
                        <button
                          key={value}
                          onClick={() => variantIdx >= 0 && setSelectedVariantIdx(variantIdx)}
                          className={`min-w-[44px] px-4 py-2.5 text-[11px] font-medium tracking-wide border transition-all ${
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

            {/* Add to Cart - outlined like Kith */}
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

            {/* Tabs */}
            {product.description && (
              <div className="pt-4">
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
                <div className="pt-4 text-[13px] text-muted-foreground leading-relaxed">
                  {activeTab === "description" && <p>{product.description}</p>}
                  {activeTab === "details" && (
                    <div className="space-y-1.5 text-xs">
                      {selectedVariant?.selectedOptions.map((opt) => (
                        <p key={opt.name}>
                          <span className="text-foreground">{opt.name}:</span> {opt.value}
                        </p>
                      ))}
                      <p><span className="text-foreground">Handle:</span> {product.handle}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
