import MerchNavbar from "@/components/MerchNavbar";
import ProductCard from "@/components/ProductCard";
import concertBg from "@/assets/concert-bg.jpg";
import hoodieBlack from "@/assets/hoodie-black.png";
import capBlack from "@/assets/cap-black.png";
import hoodieTan from "@/assets/hoodie-tan.png";
import tshirtBlack from "@/assets/tshirt-black.png";

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
    <div className="min-h-screen bg-background">
      <MerchNavbar />

      {/* Hero / Products Section with concert background */}
      <section
        className="relative min-h-screen pt-14"
        style={{
          backgroundImage: `url(${concertBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-background/40" />

        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16">
            {products.map((product) => (
              <ProductCard key={product.name} {...product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
