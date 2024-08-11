import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FoodsOffered, Place } from "@/lib/types";

type Props = {
  foodsOffered: FoodsOffered[] | undefined;
};

const PlaceFoodMenuCard = ({ foodsOffered }: Props) => {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Food Menu</CardTitle>
        <CardDescription>Delicious foods served by this place</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[10rem] w-full">
          <div className="flex gap-1 flex-wrap">
            {foodsOffered
              ? foodsOffered.map((food) => (
                  <Badge variant="default" key={food}>
                    {food}
                  </Badge>
                ))
              : "Unspecified"}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PlaceFoodMenuCard;
