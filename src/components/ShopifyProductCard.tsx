import { Link } from "react-router-dom";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShopifyProductCardProps {
  product: ShopifyProduct;
}

const ShopifyProductCard = ({ product }: ShopifyProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);
  const { node } = product;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const firstVariant = node.variants.edges[0]?.node;
  const isAvailable = firstVariant?.availableForSale ?? false;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant || !isAvailable) return;
    await addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    });
    toast.success(`${node.title} agregado al carrito`, { position: "top-center" });
  };

  return (
    <div className="group text-center">
      <Link to={`/product/${node.handle}`}>
        <div className="relative mb-4 animate-float">
          {image ? (
            <img
              src={image.url}
              alt={image.altText || node.title}
              className="w-full max-w-[480px] mx-auto aspect-square object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full max-w-[480px] mx-auto aspect-square bg-card rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Sin imagen</span>
            </div>
          )}
          {!isAvailable && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <span className="bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full">
                Agotado
              </span>
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-foreground underline-offset-2 group-hover:underline transition-all">
          {node.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
        </p>
      </Link>
      {isAvailable && (
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="mt-3 inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShoppingCart className="w-3 h-3" />}
          Agregar al carrito
        </button>
      )}
    </div>
  );
};

export default ShopifyProductCard;
