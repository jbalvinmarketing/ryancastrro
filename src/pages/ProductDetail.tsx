import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { storefrontApiRequest, PRODUCT_BY_HANDLE_QUERY, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import MerchNavbar from "@/components/MerchNavbar";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct["node"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
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

  return (
    <div className="bg-background min-h-screen">
      <MerchNavbar />
      <div className="container mx-auto px-4 pt-20 pb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-card rounded-lg overflow-hidden">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || product.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sin imagen</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      idx === selectedImage ? "border-accent" : "border-border"
                    }`}
                  >
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">{product.title}</h1>
              <p className="text-2xl font-semibold text-foreground mt-2">
                {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
              </p>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Variant selection */}
            {product.options.map((option) => {
              if (option.name === "Title" && option.values.length === 1 && option.values[0] === "Default Title") return null;
              return (
                <div key={option.name} className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{option.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const variantIdx = product.variants.edges.findIndex(v =>
                        v.node.selectedOptions.some(o => o.name === option.name && o.value === value)
                      );
                      const isSelected = selectedVariant?.selectedOptions.some(o => o.name === option.name && o.value === value);
                      return (
                        <button
                          key={value}
                          onClick={() => variantIdx >= 0 && setSelectedVariantIdx(variantIdx)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            isSelected
                              ? "border-accent bg-accent text-accent-foreground"
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

            <button
              onClick={handleAddToCart}
              disabled={isCartLoading || !isAvailable}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCartLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : !isAvailable ? (
                "Agotado"
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al carrito
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
