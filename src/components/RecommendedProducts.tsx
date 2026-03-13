import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { storefrontApiRequest, PRODUCTS_QUERY, ShopifyProduct } from "@/lib/shopify";
import { Loader2 } from "lucide-react";

interface RecommendedProductsProps {
  currentHandle: string;
}

const RecommendedProducts = ({ currentHandle }: RecommendedProductsProps) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 8 });
        const allProducts: ShopifyProduct[] = data?.data?.products?.edges || [];
        setProducts(allProducts.filter(p => p.node.handle !== currentHandle).slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch recommended products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [currentHandle]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="border-t border-border">
      <div className="max-w-[1400px] mx-auto px-4 py-12 lg:py-16">
        <h2 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-foreground mb-8 lg:mb-10">
          TAMBIÉN TE PUEDE GUSTAR
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => {
            const { node } = product;
            const image = node.images.edges[0]?.node;
            const price = node.priceRange.minVariantPrice;

            return (
              <Link
                key={node.id}
                to={`/product/${node.handle}`}
                className="group"
              >
                <div className="aspect-[3/4] bg-card overflow-hidden mb-3">
                  {image ? (
                    <img
                      src={image.url}
                      alt={image.altText || node.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      Sin imagen
                    </div>
                  )}
                </div>
                <h3 className="text-[11px] font-medium tracking-wide text-foreground uppercase leading-snug group-hover:underline underline-offset-2">
                  {node.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  ${parseFloat(price.amount).toLocaleString("es-CO")} {price.currencyCode}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecommendedProducts;
