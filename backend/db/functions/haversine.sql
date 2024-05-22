create function haversine(lat1 decimal, long1 decimal, lat2 decimal, long2 decimal)
	returns decimal
	immutable as
	$function$
	declare 
	dLat decimal;
	dLon decimal;
	a decimal;
	rad smallint;
	c decimal;
	begin
		dLat := ((lat2 - lat1) * PI())/180.0;
		dLon := ((long2 - long1) * PI())/180.0;
		-- convert latitudes to radians
  		lat1 := (lat1 * PI()) / 180.0;
  		lat2 := (lat2 * PI()) / 180.0;

		a := POWER(SIN(dLat / 2), 2) + POWER(SIN(dLon / 2), 2) * COS(lat1) * COS(lat2);
		rad := 6371; -- Earth's radius in kilometers
  		c := 2 * ASIN(SQRT(a));
		RETURN ROUND(rad * c, 1);
	end
	$function$ language plpgsql
