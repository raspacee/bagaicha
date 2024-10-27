import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { TOP_POPULAR_FOODS } from "@/lib/config";
import { SelectedFoodsContext } from "@/main";
import { Check } from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const context = useContext(SelectedFoodsContext);
  if (!context) return <h1>Context Provider not used</h1>;

  const navigate = useNavigate();

  const handleClick = () => {
    context.updateSelectedFoods(selectedFoods);
    navigate("/find-places");
  };

  return (
    <div className="w-full min-h-screen">
      <div className="w-full flex flex-col items-center justify-center">
        <h1 className="font-black text-3xl text-center">
          Find The Best Restaurants!
        </h1>
        <div className="w-full md:w-[30rem]">
          <AspectRatio ratio={16 / 9}>
            <img
              src="/illustrations/eating.svg"
              className="w-full h-full object-contain"
            />
          </AspectRatio>
        </div>
      </div>
      <div className="w-full flex items-center justify-center flex-col">
        <h1 className="text-center text-2xl font-extrabold">
          Pick any foods from below and click find
        </h1>
        <div className="px-2 flex gap-2 flex-wrap mt-2 items-center justify-center w-full md:w-[50%]">
          {TOP_POPULAR_FOODS.map((food) => {
            const isSelected = !!selectedFoods.find((val) => val === food);

            return (
              <div
                key={food}
                className={`border rounded-full px-3 py-1 ${
                  isSelected
                    ? "border-green-600 text-green-600"
                    : "border-black"
                } cursor-pointer flex gap-1 items-center`}
                onClick={() =>
                  !isSelected
                    ? setSelectedFoods([...selectedFoods, food])
                    : setSelectedFoods(
                        selectedFoods.filter((val) => val !== food)
                      )
                }
              >
                {isSelected && <Check size={20} />}
                {food}
              </div>
            );
          })}
        </div>
        <Button
          onClick={handleClick}
          className="text-lg mt-5 bg-blue-600 hover:bg-blue-800 rounded-full w-[6rem] font-semibold"
        >
          Find
        </Button>
      </div>
      <div className="min-h-[3rem]"></div>
    </div>
  );
};

export default HomePage;
