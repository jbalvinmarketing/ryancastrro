import MerchNavbar from "@/components/MerchNavbar";
import ProductCard from "@/components/ProductCard";
import hoodieBlack from "@/assets/hoodie-black.png";
import capBlack from "@/assets/cap-black.png";
import hoodieTan from "@/assets/hoodie-tan.png";
import tshirtBlack from "@/assets/tshirt-black.png";
import hoodieWhite from "@/assets/hoodie-white.png";
import capRed from "@/assets/cap-red.png";
import joggersBlack from "@/assets/joggers-black.png";
import bagBlack from "@/assets/bag-black.png";
import videoPoster from "@/assets/video-poster.jpg";

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
  {
    image: hoodieWhite,
    name: "Hoodie Blanco RC Script",
    price: "$85.00",
    animationClass: "animate-float-delayed",
  },
  {
    image: capRed,
    name: "Gorra Roja RC Edition",
    price: "$50.00",
    preOrder: true,
    animationClass: "animate-float",
  },
  {
    image: joggersBlack,
    name: "Joggers Negro RC",
    price: "$70.00",
    animationClass: "animate-float-slow",
  },
  {
    image: bagBlack,
    name: "Crossbody Bag RC",
    price: "$40.00",
    animationClass: "animate-float-delayed",
  },
];

const Index = () => {
  return (
    <div className="bg-background">
      <MerchNavbar />

      {/* Video section - fixed to viewport height */}
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
