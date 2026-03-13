import { useState, useEffect } from "react";
import MerchNavbar from "@/components/MerchNavbar";
import ShopifyProductCard from "@/components/ShopifyProductCard";
import { storefrontApiRequest, PRODUCTS_QUERY, ShopifyProduct } from "@/lib/shopify";
import { Loader2 } from "lucide-react";
import videoPoster from "@/assets/video-poster.jpg";

const VIDEO_URL = "https://assets.cdn.filesafe.space/1z0IB1KcEYrz6wPpxZDl/media/69a0d322fd70df4f2f45dd2c.mp4";

const Index = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 20 });
        if (data?.data?.products?.edges) {
          setProducts(data.data.products.edges);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="bg-background">
      <MerchNavbar />

      {/* Video section */}
      <section className="relative h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={videoPoster}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <link rel="preload" as="video" href={VIDEO_URL} />

        <div className="absolute inset-0 bg-background/40" />

        <div className="relative z-10 h-full overflow-y-auto pt-14">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-xl font-display text-foreground mb-2">No hay productos</p>
                <p className="text-muted-foreground">Agrega productos desde tu panel de Shopify o dile al chat qué producto quieres crear.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-12">
                {products.map((product) => (
                  <ShopifyProductCard key={product.node.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
