import { Link } from "react-router-dom";
import he from "he";
import cardSkeleton from "../../assets/imgLoading.png"; // Placeholder image
// import videoIcon from "../../assets/videoIcon.svg";
import LazyLoadImage from "./LazyLoadImage";

const MovieCard = ({ movie, height, width = "114px", showDynamic = false }) => {

  return (
    <div className="movie-item max-sm:h-auto cursor-default relative mt-2">
      <Link className="block relative zoom-effect" to={`/player/${movie?.id}`}>
        <div
          className={`relative img_a h-[150px] w-full border-none ${
            height ? `max-sm:h-[150px]` : "max-sm:h-[150px]"
          }`}
        >
          <LazyLoadImage
            src={movie.cover}
            alt={movie.name}
            className={`movie_img  h-[150px] rounded-lg border-none  ${
              height ? `max-sm:h-[150px]` : "max-sm:h-[150px]"
            } cursor-default object-cover w-full`}
          />
          <div className="absolute rounded-bl-lg rounded-br-lg  h-full w-full inset-0 bg-gradient-to-b from-transparent via-black/5 to-black"></div>
          <div className="flex absolute text-[10px] justify-between items-center px-3 bottom-2 w-full">
            <p className="flex-1 truncate">{movie?.dynamic}</p>
            <p className="flex-1 flex justify-end">{movie?.type_name}</p>
          </div>
        </div>

        <div className="overlay">
          {/* <img className="h-[40px]" src={videoIcon} alt="" /> */}
        </div>
        {showDynamic && (
          <div className="top-0 right-0 search_card_score z-1 absolute">
            <span>{movie?.dynamic}</span>
          </div>
        )}
      </Link>

      <div className="text-container">
        <div className="movie-info">
          <h2 className="text-[12px] mt-3 leading-[18px] font-confortFont font-[400] text-white truncate">
            {he.decode(movie?.name || "Unknown Title")}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
