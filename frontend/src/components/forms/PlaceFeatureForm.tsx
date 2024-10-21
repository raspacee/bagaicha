import {
  useAddFeatureToPlace,
  useFetchAllDatabaseFeatures,
  useFetchPlaceFeatures,
  useRemoveFeatureFromPlace,
} from "@/api/FeatureApi";
import { Checkbox } from "../ui/checkbox";

type Props = {
  placeId: string;
};
const PlaceFeatureForm = ({ placeId }: Props) => {
  const { placeFeatures, isLoading } = useFetchPlaceFeatures(placeId);
  const { features } = useFetchAllDatabaseFeatures();
  const { addFeature, isPending: isAdding } = useAddFeatureToPlace(placeId);
  const { removeFeature, isPending: isRemoving } =
    useRemoveFeatureFromPlace(placeId);

  return (
    <>
      <h1 className="text-xl font-bold self-start mb-3">Place Features</h1>
      <div className="w-full flex flex-row flex-wrap gap-4">
        {features &&
          features.map((feature) => (
            <div key={feature.id} className="flex items-center space-x-2">
              <Checkbox
                id={feature.featureName}
                onCheckedChange={(checked) => {
                  if (checked) {
                    addFeature(feature.id);
                  } else {
                    removeFeature(feature.id);
                  }
                }}
                disabled={isAdding || isRemoving}
                checked={
                  placeFeatures
                    ? placeFeatures.filter((f) => f.id == feature.id).length > 0
                    : false
                }
              />
              <label
                htmlFor={feature.featureName}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {feature.featureName}
              </label>
            </div>
          ))}
      </div>
    </>
  );
};

export default PlaceFeatureForm;
