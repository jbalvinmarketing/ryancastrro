import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MerchNavbar from "@/components/MerchNavbar";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { Loader2 } from "lucide-react";

const VIDEO_URL = "https://assets.cdn.filesafe.space/1z0IB1KcEYrz6wPpxZDl/media/69a0d322fd70df4f2f45dd2c.mp4";

const FLOAT_CLASSES = ["animate-float", "animate-float-delayed", "animate-float-slow"];

const Index = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts(20)
      .then((data) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (amount: string, currency: string) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency }).format(parseFloat(amount));

  return (
    <div className="bg-background">
      <MerchNavbar />

      <section className="relative h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-background/40" />

        <div className="relative z-10 h-full overflow-y-auto pt-14">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <p className="text-center text-muted-foreground py-20">No products found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-12">
                {products.map((product, i) => {
                  const { node } = product;
                  const image = node.images.edges[0]?.node;
                  const price = node.priceRange.minVariantPrice;
                  const floatClass = FLOAT_CLASSES[i % FLOAT_CLASSES.length];

                  return (
                    <div
                      key={node.id}
                      className="group cursor-pointer text-center"
                      onClick={() => navigate(`/product/${node.handle}`)}
                    >
                      <div className={`relative mb-4 ${floatClass}`}>
                        {image && (
                          <img
                            src={image.url}
                            alt={image.altText || node.title}
                            className="w-full max-w-[480px] mx-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-foreground underline-offset-2 group-hover:underline transition-all">
                        {node.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatPrice(price.amount, price.currencyCode)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-display text-lg font-bold tracking-wider uppercase">Ryan Castro</span>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Ryan Castro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
    </div>
  );
};

export default Index;
