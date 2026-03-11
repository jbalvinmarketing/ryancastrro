interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  soldOut?: boolean;
  preOrder?: boolean;
  animationClass?: string;
}

const ProductCard = ({ image, name, price, soldOut, preOrder, animationClass = "animate-float" }: ProductCardProps) => {
  return (
    <div className="group cursor-pointer text-center">
      <div className={`relative mb-4 ${animationClass}`}>
        <img
          src={image}
          alt={name}
          className="w-full max-w-[480px] mx-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
        />
        {(soldOut || preOrder) && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {soldOut && (
              <span className="bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full">
                Sold out
              </span>
            )}
            {preOrder && (
              <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                Pre-order
              </span>
            )}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-foreground underline-offset-2 group-hover:underline transition-all">
        {name}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">{price}</p>
    </div>
  );
};

export default ProductCard;
