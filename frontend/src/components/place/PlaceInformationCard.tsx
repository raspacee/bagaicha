import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cake, Castle, Hourglass } from "lucide-react";
import { haversine } from "@/lib/helpers";
import { PlaceWithRating } from "@/lib/types";
import { useAppSelector } from "@/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { DateTime } from "luxon";
import { useGetOperatingHours } from "@/api/PlaceApi";

type Props = {
  place: PlaceWithRating;
};

const PlaceInformationCard = ({ place }: Props) => {
  const location = useAppSelector((state) => state.location);
  const { isLoading: isOperatingHoursLoading, operatingHours } =
    useGetOperatingHours(place.id);

  const currentDay = DateTime.now().toFormat("cccc");
  const currentTime = DateTime.now();

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Place Information</CardTitle>
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
                <p>Operating Hours</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {operatingHours ? (
            <div className="flex flex-col gap-2">
              {operatingHours?.map((operatingHour) => (
                <div
                  key={operatingHour.id!}
                  className="flex flex-row gap-2 items-center"
                >
                  <p className="min-w-20">{operatingHour.day}</p>
                  {operatingHour.openingTime && operatingHour.closingTime && (
                    <p className="text-sm">
                      {`${DateTime.fromFormat(
                        operatingHour.openingTime,
                        "hh:mm:ss"
                      ).toFormat("hh:mm a")} 
                     - ${DateTime.fromFormat(
                       operatingHour.closingTime,
                       "hh:mm:ss"
                     ).toFormat("hh:mm a")}`}

                      {currentDay.toLowerCase() ===
                        operatingHour.day.toLowerCase() &&
                        (currentTime >=
                          DateTime.fromFormat(
                            operatingHour.openingTime,
                            "hh:mm:ss"
                          ) &&
                        currentTime <=
                          DateTime.fromFormat(
                            operatingHour.closingTime,
                            "hh:mm:ss"
                          ) ? (
                          <span className="text-green-600 ml-1 font-semibold">
                            Open
                          </span>
                        ) : (
                          <span className="text-red-600 ml-1">Closed</span>
                        ))}
                    </p>
                  )}
                  {!operatingHour.openingTime && (
                    <p className="text-muted-foreground text-sm">
                      Time not specified
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Operating Hours Not Specified
            </p>
          )}
        </div>

        <div className="flex flex-row items-center gap-2">
          <Cake size={22} />
          <p className="text-sm text-muted-foreground">
            {`Page created on ${DateTime.fromISO(place.createdAt).toFormat(
              "DDD"
            )}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceInformationCard;
