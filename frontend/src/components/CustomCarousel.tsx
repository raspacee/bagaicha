import { useState } from "react";
import { Button } from "./ui/button";

type Props = {
  images: string[];
  defaultActiveIdx: number;
};

const CustomCarousel = ({ images, defaultActiveIdx }: Props) => {
  const [activeIdx, setActiveIdx] = useState(defaultActiveIdx);

  const prev = () => {
    setActiveIdx((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const next = () => {
    setActiveIdx((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="w-full h-full">
      <img
        src={images[activeIdx]}
        className="w-full max-h-full h-auto object-contain"
      />
      <Button onClick={next}>Next</Button>
      <Button onClick={prev}>Previous</Button>
    </div>
  );
};

export default CustomCarousel;
