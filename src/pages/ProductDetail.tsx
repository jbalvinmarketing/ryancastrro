import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { storefrontApiRequest, PRODUCT_BY_HANDLE_QUERY, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, Loader2, ChevronRight } from "lucide-react";
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

  // Get the current color option value
  const colorOption = selectedVariant?.selectedOptions.find(
    o => o.name.toLowerCase() === "color"
  );

  return (
    <div className="bg-background min-h-screen">
      <MerchNavbar />

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 pt-16 pb-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">HOME</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{product.title.toUpperCase()}</span>
          </nav>
        </div>
      </div>

      {/* Main layout */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-0">

          {/* LEFT: Thumbnail strip (desktop only) */}
          <div className="hidden lg:flex flex-col gap-2 py-6 pr-4 w-[72px] flex-shrink-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-14 h-14 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                  idx === selectedImage
                    ? "border-foreground"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img
                  src={img.node.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* CENTER: Main image(s) */}
          <div className="flex-1 lg:border-r lg:border-l border-border">
            {/* Mobile: single image with horizontal thumbnails */}
            <div className="lg:hidden">
              <div className="aspect-square bg-card">
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
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-14 h-14 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
                        idx === selectedImage
                          ? "border-foreground"
                          : "border-transparent opacity-50"
                      }`}
                    >
                      <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop: stacked full images */}
            <div className="hidden lg:block">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="w-full bg-card"
                >
                  <img
                    src={img.node.url}
                    alt={img.node.altText || product.title}
                    className="w-full object-contain max-h-[85vh]"
                  />
                </div>
              ))}
              {images.length === 0 && (
                <div className="aspect-square flex items-center justify-center text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product info (sticky on desktop) */}
          <div className="lg:w-[420px] xl:w-[460px] flex-shrink-0">
            <div className="lg:sticky lg:top-14 p-6 lg:p-8 space-y-5">
              {/* Title & Price */}
              <div>
                <h1 className="font-display text-xl font-semibold tracking-wide text-foreground uppercase leading-tight">
                  {product.title}
                </h1>
                <p className="text-sm text-foreground mt-2">
                  ${parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
                </p>
              </div>

              <hr className="border-border" />

              {/* Color display */}
              {colorOption && (
                <p className="text-xs tracking-widest text-muted-foreground uppercase">
                  COLOR: {colorOption.value}
                </p>
              )}

              {/* Variant selection */}
              {product.options.map((option) => {
                if (option.name === "Title" && option.values.length === 1 && option.values[0] === "Default Title") return null;
                if (option.name.toLowerCase() === "color" && option.values.length <= 1) return null;

                return (
                  <div key={option.name} className="space-y-2">
                    {option.name.toLowerCase() !== "color" && (
                      <label className="text-xs tracking-widest text-muted-foreground uppercase">
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
                            className={`min-w-[48px] px-4 py-2.5 text-xs font-medium tracking-wide border transition-all ${
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
                );
              })}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isCartLoading || !isAvailable}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-xs font-semibold tracking-widest uppercase bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCartLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : !isAvailable ? (
                  "AGOTADO"
                ) : (
                  "AGREGAR AL CARRITO"
                )}
              </button>

              {/* Tabs: Description / Details */}
              {product.description && (
                <div className="pt-4">
                  <div className="flex border-b border-border">
                    <button
                      onClick={() => setActiveTab("description")}
                      className={`text-xs font-semibold tracking-widest uppercase pb-3 mr-8 transition-colors border-b-2 -mb-px ${
                        activeTab === "description"
                          ? "border-foreground text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      DESCRIPCIÓN
                    </button>
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`text-xs font-semibold tracking-widest uppercase pb-3 transition-colors border-b-2 -mb-px ${
                        activeTab === "details"
                          ? "border-foreground text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      DETALLES
                    </button>
                  </div>

                  <div className="pt-4 text-sm text-muted-foreground leading-relaxed">
                    {activeTab === "description" && (
                      <p>{product.description}</p>
                    )}
                    {activeTab === "details" && (
                      <div className="space-y-1.5 text-xs">
                        {selectedVariant?.selectedOptions.map((opt) => (
                          <p key={opt.name}>
                            <span className="text-foreground">{opt.name}:</span>{" "}
                            {opt.value}
                          </p>
                        ))}
                        <p>
                          <span className="text-foreground">Handle:</span>{" "}
                          {product.handle}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
