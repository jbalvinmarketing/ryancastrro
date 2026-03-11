import MerchNavbar from "@/components/MerchNavbar";
import ProductCard from "@/components/ProductCard";
import hoodieBlack from "@/assets/hoodie-black.png";
import capBlack from "@/assets/cap-black.png";
import hoodieTan from "@/assets/hoodie-tan.png";
import tshirtBlack from "@/assets/tshirt-black.png";

const VIDEO_URL = "https://assets.cdn.filesafe.space/1z0IB1KcEYrz6wPpxZDl/media/69a0d322fd70df4f2f45dd2c.mp4";

const products = [
  {
    image: capBlack,
    name: "RC Snapback Gorra Negra",
    price: "$55.00",
    soldOut: true,
    preOrder: true,
    animationClass: "animate-float",
  },
  {
    image: hoodieBlack,
    name: "Hoodie Negro RC Logo",
    price: "$85.00",
    animationClass: "animate-float-delayed",
  },
  {
    image: hoodieTan,
    name: "Hoodie Tan Oversized",
    price: "$90.00",
    animationClass: "animate-float-slow",
  },
  {
    image: tshirtBlack,
    name: "Camiseta Tour Graphic",
    price: "$45.00",
    animationClass: "animate-float",
  },
];

const Index = () => {
  return (
    <div className="bg-background">
      <MerchNavbar />

      {/* Video section - fixed to viewport height on desktop, auto on mobile */}
      <section className="relative h-auto sm:h-screen overflow-hidden">
        {/* Video background - fixed position effect */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-background/40" />

        {/* Products grid scrollable over fixed video on desktop */}
        <div className="relative z-10 h-full overflow-y-auto pt-14">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-12">
              {products.map((product) => (
                <ProductCard key={product.name} {...product} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
