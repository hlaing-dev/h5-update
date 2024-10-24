import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetHeaderTopicsQuery } from "../../pages/home/services/homeApi";
import MovieCard from "./MovieCard";
import Loader from "../../pages/search/components/Loader";
import FilterTag from "./FilterTag";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

const FilterMovie = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [movieData, setMovieData] = useState([]);
  const dispatch = useDispatch();
  const activeTab = useSelector((state: any) => state.explore.activeTab);
  const sort = useSelector((state: any) => state.explore.sort);
  const classData = useSelector((state: any) => state.explore.class);
  const area = useSelector((state: any) => state.explore.area);
  const year = useSelector((state: any) => state.explore.year);
  const [page, setPage] = useState(1);

  const getMoviesByType = async (id: any) => {
    setIsLoading(true);
    const { data } = await axios.get(
      `https://cc3e497d.qdhgtch.com:2345/api/v1/movie/explore/list?type_id=${id}&&sort=${sort}&&class=${classData}&&area=${area}&&year=${year}&&page=${page}&&pageSize=9`
    );
    if (data?.data?.list?.length >= 0) setIsLoading(false);
    setMovieData(data?.data?.list);
  };

  const fetchData = async () => {
    setPage(page + 1);
    const { data } = await axios.get(
      `https://cc3e497d.qdhgtch.com:2345/api/v1/movie/explore/list?type_id=${activeTab}&&sort=${sort}&&class=${classData}&&area=${area}&&year=${year}&&page=${page}&&pageSize=9`
    );
    if (data?.data?.list?.length >= 0) setIsLoading(false);
    setMovieData(movieData.concat(data?.data?.list));
  };

  useEffect(() => {
    getMoviesByType(activeTab);
    setPage(1);
  }, [activeTab, sort, area, year, classData]);

  return (
    <div className="bg-background text-text min-h-screen">
      <div className="">
        <FilterTag />
        {movieData?.length ? (
          <>
            {isLoading ? (
              <div className="flex w-full justify-center items-center mt-10">
                <Loader />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 pt-5 pb-32 px-3">
                  {movieData?.map((movie: any) => (
                    <Link
                      to={`/player/${movie?.id}`}
                      key={movie?.id}
                      className="mx-auto"
                    >
                      <MovieCard movie={movie} height={"200px"} />
                    </Link>
                  ))}
                </div>
                <InfiniteScroll
                  dataLength={movieData?.length} //This is important field to render the next data
                  next={fetchData}
                  hasMore={true}
                  loader={
                    <div className="flex justify-center items-center pb-20 will mx-auto">
                      <Loader />
                    </div>
                  }
                >
                  {/* {item} */}
                </InfiniteScroll>
              </>
            )}
          </>
        ) : (
          <div className="text-center flex justify-center items-center w-full pt-32 px-3">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterMovie;
