import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cake, CalendarDays, Castle, Hourglass } from "lucide-react";
import { haversine } from "@/lib/helpers";
import { Place } from "@/lib/types";
import { useAppSelector } from "@/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { DateTime } from "luxon";

type Props = {
  place: Place;
};

const PlaceInformationCard = ({ place }: Props) => {
  const location = useAppSelector((state) => state.location);

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Place Information</CardTitle>
        <CardDescription>Hover on the icon to know more</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <Castle size={22} />
          <p className="text-sm text-muted-foreground">
            {`${haversine(
              location.lat,
              location.long,
              place.lat,
              place.lon
            )} km away from you`}
          </p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger>
                <Hourglass size={22} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Opening - Closing Time</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <p className="text-sm text-muted-foreground">
            {place.openingTime && place.closingTime
              ? `${DateTime.fromISO(place.openingTime).toFormat(
                  "h a"
                )} - ${DateTime.fromISO(place.closingTime).toFormat("h a")}`
              : "Unspecified"}
          </p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger>
                <CalendarDays size={22} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Open Days</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <p className="text-sm text-muted-foreground">
            {place.openDays ? place.openDays.join(", ") : "Unspecified"}
          </p>
        </div>

        <div className="flex flex-row items-center gap-2">
          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger>
                <Cake size={22} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Opened On</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-sm text-muted-foreground">
            {DateTime.fromISO(place.createdAt).toFormat("DDD")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceInformationCard;
