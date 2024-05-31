import PlaceIcon from "@mui/icons-material/Place";
import SocialDistanceIcon from "@mui/icons-material/SocialDistance";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PhoneIcon from "@mui/icons-material/Phone";
import DirectionsIcon from "@mui/icons-material/Directions";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ClearIcon from "@mui/icons-material/Clear";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import SendIcon from "@mui/icons-material/Send";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LocationCityIcon from "@mui/icons-material/LocationCity";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Unstable_Grid2";
import Chip from "@mui/material/Chip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { DateTime } from "luxon";
import Cookies from "universal-cookie";

import Map from "../components/place/Map";
import { isMod } from "../lib/isMod";
import { place_features } from "./edit_place";
import { AUTH_TOKEN } from "../lib/cookie_names";
import { useAppSelector } from "../hooks";
import { haversine } from "../lib/helpers";

const labels: { [index: string]: string } = {
  1: "Extremely bad",
  2: "Poor",
  3: "Ok",
  4: "Good",
  5: "Excellent",
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Place() {
  const [hover, setHover] = useState(-1);
  const [place, setPlace] = useState<any | null>(null);
  const [data, setData] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [aggregatedRating, setAggregatedRating] = useState<number>(0);
  const [placeReviews, setPlaceReviews] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(
    searchParams.get("rating")
      ? (5 - parseInt(searchParams.get("rating")!)).toString()
      : "0",
  );
  const location = useAppSelector((state) => state.location);
  const { place_id } = useParams();
  const cookies = new Cookies(null, {
    path: "/",
  });

  useEffect(() => {
    const fetchPlaceData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/place/${place_id}`,
          {
            method: "GET",
            mode: "cors",
          },
        );
        const data = await response.json();
        if (data.status == "ok" && data.place != null) {
          setPlace(data.place.place);
          setData(data.place);
          const aggregated_rating =
            parseInt(data.place.total_count) == 0
              ? 0
              : (parseInt(data.place.five_star_count) +
                  parseInt(data.place.four_star_count) +
                  parseInt(data.place.three_star_count) +
                  parseInt(data.place.two_star_count) +
                  parseInt(data.place.one_star_count)) /
                parseInt(data.place.total_count);
          setAggregatedRating(aggregated_rating);

          const bool = await isMod();
          setIsModerator(bool || false);
        } else {
          throw new Error("No place found");
        }
      } catch (err) {
        console.error(err);
      }
      const bool = await isMod();
      setIsModerator(bool || false);
    };
    fetchPlaceData();
  }, [place_id]);

  useEffect(() => {
    const fetch_reviews = async (rating: string) => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/place/review?rating=${rating}&place_id=${place_id}`,
          {
            method: "get",
            headers: {
              authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
              "content-type": "application/json",
            },
          },
        );
        const data = await res.json();
        if (data.reviews != null) setPlaceReviews(data.reviews);
        else setPlaceReviews([]);
      } catch (err) {
        console.log(err);
      }
    };

    fetch_reviews(searchParams.get("rating")!);
  }, [searchParams.get("rating")]);

  const handleSubmit = async () => {
    try {
      const valid_ratings = [1, 2, 3, 4, 5];
      if (valid_ratings.includes(rating) && body.trim() != "") {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/place/review`,
          {
            method: "post",
            body: JSON.stringify({
              place_id: place_id,
              rating: rating,
              textbody: body,
            }),
            headers: {
              authorization: `Bearer ${cookies.get(AUTH_TOKEN)}`,
              "content-type": "application/json",
            },
          },
        );
        if (res.ok) {
          setRating(0);
          setBody("");
          setOpen(true);
        }
      } else {
        alert("Form not valid");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  if (place == null) {
    return (
      <div className="bg-white w-full mt-3 ml-3 mr-2 px-3 py-2">
        <Stack spacing={2}>
          <Skeleton variant="rounded" width={600} height={200} />
          <Skeleton variant="rounded" width={600} height={80} />
        </Stack>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-lg mt-3 ml-3 mr-2 px-3 py-2">
      <div className="grid grid-cols-2 gap-2 my-2">
        <img
          src={place.cover_img_url}
          className="rounded-md w-[25rem] h-[25rem] object-cover"
        />
        <div className="w-full py-3">
          <Stack spacing={1}>
            <div className="w-full">
              <span className="w-1/4">
                <LocationCityIcon
                  fontSize="medium"
                  style={{ color: "#0d47a1" }}
                />
              </span>
              <span className="w-full ml-2">{place.name}</span>
            </div>
            <div className="w-full">
              <span className="w-1/4">
                <PlaceIcon fontSize="medium" style={{ color: "#239B56" }} />
              </span>
              <span className="w-full ml-2">
                {place.display_name.split(",")[1]},{" "}
                {place.display_name.split(",")[2]}
              </span>
            </div>
            <div className="w-full">
              <span className="w-1/4">
                <PhoneIcon fontSize="medium" style={{ color: "#0d47a1" }} />
              </span>
              <span className="w-full ml-2">
                {place.phone_no ? place.phone_no : "Not available"}
              </span>
            </div>
            <div className="w-full">
              <span className="w-1/4">
                <DirectionsIcon
                  fontSize="medium"
                  style={{ color: "#0d47a1" }}
                />
              </span>
              <span className="w-full">
                <Button>Get Directions</Button>
              </span>
            </div>
            <div className="w-full">
              <span className="w-1/4">
                <QueryBuilderIcon
                  fontSize="medium"
                  style={{ color: "#0d47a1" }}
                />
              </span>
              <span className="w-full ml-2">
                <span className="font-medium text-green-600">Open</span>
                <span className="ml-1">
                  {DateTime.fromSQL(place.opening_time).toFormat("hh:mm a")}{" "}
                  <span> - </span>
                  {DateTime.fromSQL(place.closing_time).toFormat("hh:mm a")}
                </span>
              </span>
            </div>

            <div className="w-full">
              <span className="w-1/4">
                <MyLocationIcon
                  fontSize="medium"
                  style={{ color: "#0d47a1" }}
                />
              </span>
              <span className="w-full ml-2">
                {place.lat}, {place.long}
              </span>
            </div>
            <div className="w-full">
              <span className="w-1/4">
                <SocialDistanceIcon style={{ color: "#0d47a1" }} />
              </span>
              <span className="w-full ml-2">
                {haversine(location.lat, location.long, place.lat, place.long)}{" "}
                km away
              </span>
            </div>
            {isModerator && (
              <div className="w-full">
                <Link to={`/edit-place/${place.id}`}>
                  <Button variant="outlined">Edit information</Button>
                </Link>
              </div>
            )}
          </Stack>
        </div>
      </div>
      <Divider />
      <div className="grid grid-cols-2 gap-2 my-2">
        <div className="col-span-1">
          <div className="w-3/4 my-2">
            <Grid container spacing={1}>
              {place.place_features != null &&
              place.place_features.length > 0 ? (
                place.place_features.map((f: number) => {
                  const feature = place_features.find(
                    (data) => data.value == f,
                  );
                  return (
                    <Grid xs={4}>
                      <Chip
                        label={feature?.label}
                        icon={<CheckIcon color="success" />}
                        variant="outlined"
                      />
                    </Grid>
                  );
                })
              ) : (
                <p className="font-light text-sm text-gray-500">
                  This information is yet to be added
                </p>
              )}
            </Grid>
          </div>
          <Divider />
          <div className="my-2">
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                Open days
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {DAYS.map((day) => {
                    return (
                      <OpenDayItem
                        day={day}
                        open={place.open_days.includes(day.toLowerCase())}
                      />
                    );
                  })}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </div>
          <Divider />
          <div className="my-2">
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                Menu
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {place.foods_offered != null ? (
                    place.foods_offered.map((food: string) => {
                      return (
                        <Grid xs={3}>
                          <Chip label={food} />
                        </Grid>
                      );
                    })
                  ) : (
                    <Typography variant="body1">
                      This information is yet to be added
                    </Typography>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </div>

          <Divider />
          <div className="px-2 py-2 my-2">
            <Typography variant="body1">
              Alcohol allowed
              <span className="ml-2">
                {place.alcohol_allowed ? (
                  <CheckIcon color="success" />
                ) : (
                  <ClearIcon color="error" />
                )}
              </span>
            </Typography>
          </div>
          <Divider />
          <div className="my-2 px-2 py-1">
            <Button>Request to edit this page</Button>
          </div>
        </div>
        <div className="col-span-1">
          <Map
            placeName={place.name}
            placeLocation={{
              lat: parseFloat(place.lat),
              long: parseFloat(place.long),
            }}
          />
        </div>
      </div>
      <Divider />
      <div className="grid grid-cols-2 my-2">
        <div className="col-span-1 border-r-2 flex flex-col items-center">
          <span className="text-3xl">{aggregatedRating}</span>
          <div className="flex">
            <Rating
              size="large"
              value={aggregatedRating}
              readOnly
              precision={0.5}
            />
          </div>
          <div>{data.total_count} ratings</div>
        </div>
        <div className="col-span-1 flex flex-col items-center">
          <div className="flex">
            <Rating value={5} readOnly />
            <span className="ml-3 w-5">{data.five_star_count}</span>
          </div>
          <div className="flex">
            <Rating size="medium" value={4} readOnly />
            <span className="ml-3 w-5">{data.four_star_count}</span>
          </div>
          <div className="flex">
            <Rating size="medium" value={3} readOnly />
            <span className="ml-3 w-5">{data.three_star_count}</span>
          </div>
          <div className="flex">
            <Rating size="medium" value={2} readOnly />
            <span className="ml-3 w-5">{data.two_star_count}</span>
          </div>
          <div className="flex">
            <Rating size="medium" value={1} readOnly />
            <span className="ml-3 w-5">{data.one_star_count}</span>
          </div>
        </div>
      </div>
      <Divider />
      <div className="my-2 px-2 flex flex-col items-center">
        <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            Successfully submitted your review
          </Alert>
        </Snackbar>
        <Typography variant="h6">Write a review</Typography>
        <Rating
          name="hover-feedback"
          value={rating}
          size="large"
          getLabelText={getLabelText}
          onChange={(event, newValue) => {
            setRating(newValue!);
          }}
          onChangeActive={(event, newHover) => {
            setHover(newHover);
          }}
          emptyIcon={
            <StarOutlineIcon style={{ opacity: 0.55 }} fontSize="inherit" />
          }
        />
        {hover != 0 && (
          <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : rating]}</Box>
        )}
        <textarea
          className="my-3 resize-none border-gray-400 w-[30rem] h-[5rem] rounded-md"
          placeholder="write your review here"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button
          onClick={handleSubmit}
          variant="outlined"
          endIcon={<SendIcon />}
        >
          Submit
        </Button>
      </div>
      <Divider />
      <div className="w-full">
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
            setSearchParams({
              rating: (5 - newValue).toString(),
            });
          }}
        >
          <BottomNavigationAction label="5" icon={<StarOutlineIcon />} />
          <BottomNavigationAction label="4" icon={<StarOutlineIcon />} />
          <BottomNavigationAction label="3" icon={<StarOutlineIcon />} />
          <BottomNavigationAction label="2" icon={<StarOutlineIcon />} />
          <BottomNavigationAction label="1" icon={<StarOutlineIcon />} />
        </BottomNavigation>
      </div>
      <div className="min-h-80 w-full flex flex-col">
        {placeReviews.length == 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <VisibilityOffIcon fontSize="large" />
            <Typography variant="h5" style={{ marginLeft: "1.5rem" }}>
              No reviews yet
            </Typography>
          </div>
        ) : (
          placeReviews.map((review) => <PlaceReviewItem review={review} />)
        )}
      </div>
    </div>
  );
}

const PlaceReviewItem = ({ review }: { review: any }) => {
  return (
    <div className="border my-2 px-3 py-2 rounded-md">
      <div className="flex">
        <div className="flex items-center">
          <Avatar alt="Remy Sharp" src={review.profile_picture_url} />
          <Link to={`/user/${review.email}`}>
            <p className="ml-2">
              {review.first_name} {review.last_name}
            </p>
          </Link>
        </div>
        <div className="flex items-center ml-2">
          <Rating value={review.rating} readOnly size="small" />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-600 mt-1">
          {DateTime.fromISO(review.created_at).toFormat("DDD")}
        </p>
        <p>{review.body}</p>
      </div>
    </div>
  );
};

const OpenDayItem = ({ day, open }: { day: string; open: boolean }) => {
  return (
    <div className="w-full">
      <span className="w-3/4 text-sm">{day}</span>
      <span className="w-full ml-2">
        {open ? <CheckIcon color="success" /> : <ClearIcon color="error" />}
      </span>
    </div>
  );
};

function getLabelText(value: number) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}
