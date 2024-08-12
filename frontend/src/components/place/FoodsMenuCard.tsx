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
  description: string;
  header?: string;
  onClick?: (food: FoodsOffered) => void;
};

const FoodsMenuCard = ({
  foodsOffered,
  header,
  description,
  onClick,
}: Props) => {
  return (
    <Card className="flex-1">
      <CardHeader>
        {header && <CardTitle>{header}</CardTitle>}
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[10rem] w-full">
          <div className="flex gap-1 flex-wrap">
            {foodsOffered
              ? foodsOffered.map((food) => (
                  <Badge
                    variant="default"
                    key={food}
                    onClick={onClick ? () => onClick(food) : undefined}
                    className="cursor-pointer"
                  >
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

export default FoodsMenuCard;
