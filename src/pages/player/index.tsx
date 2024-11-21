import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import VideoPlayer from "./video/VideoPlayer";
import SourceSelector from "./video/SourceSelector";
import DetailSection from "./video/DetailSection";
import EpisodeSelector from "./video/EpisodeSelector";
import Loader from "../search/components/Loader";
import noPlayImage from "../../assets/noplay.svg";
import RecommendedList from "./video/RecommendedList";
import AdsSection from "./video/AdsSection";
import NetworkError from "./video/NetworkError";
import { Episode, MovieDetail, AdsData } from "../../model/videoModel";
import {
  getMovieDetail,
  getAdsData,
  getEpisodesBySource,
  reportPlaybackProgress,
} from "../../services/playerService";
import NewAds from "../../components/NewAds";

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movieDetail, setMovieDetail] = useState<MovieDetail | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [adsData, setAdsData] = useState<AdsData | null>(null);
  const [selectedSource, setSelectedSource] = useState(0);
  const [activeTab, setActiveTab] = useState("tab-1");
  const [resumeTime, setResumeTime] = useState(0);
  const [wholePageError, setWholePageError] = useState(false);
  const [errorVideoUrl, setErrorVideoUrl] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const [episodes, setEpisodes] = useState<any>([]);
  const [forwardedCount, setForwardedCount] = useState(-1);
  const [movieReload, setMovieReload] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    fetchComments();
  },[])

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/movie/comments/index?movie_id=${id}&page=${1}&pageSize=10`
        // "http://localhost:3001/comments"
      );
      const data = await response.json();
      setCommentCount(data.data.total);
      console.log('data is=>', data);
    } catch (err) {
      console.log('err is=>', err);
    }
  }
  const autoPlayNextEpisode = async () => {
    if (!movieDetail?.play_from) return;
    for (let i = selectedSource + 1; i < movieDetail.play_from.length; i++) {
      const nextSource = movieDetail.play_from[i];
      try {
        const res = await getEpisodesBySource(nextSource.code, id || "");
        setCurrentEpisode(res.data[0]);
        setEpisodes(res.data);
        setSelectedSource(i);
        if (res.data?.[0]?.ready_to_play) {
          setWholePageError(false);
        } else {
          setWholePageError(true);
          setErrorVideoUrl(res.data?.[0]?.play_url);
        }
        return;
      } catch (error) {
        console.error("Error auto-playing next episode:", error);
      }
    }
    // console.log('hello')
    setTimeout(()=>{
      setVisible(true);
      setWholePageError(true);
    }, 1000);
    setTimeout(()=>{
      setVisible(false);
    }, 3000)
  };

  useEffect(() => {
    if (id) {
      setWholePageError(false);
      fetchMovieDetail();
      fetchAdsData();
    }
  }, [id]);

  const fetchAdsData = async () => {
    try {
      const res = await getAdsData();
      setAdsData(res.data);
    } catch (error) {
      console.error("Error fetching ads data:", error);
    }
  };

  const fetchMovieDetail = async (movieId = "") => {
    try {
      const res = await getMovieDetail(movieId || id || "");
      await setMovieDetail(res?.data);
      await setInitialEpisode(res?.data);
      setWholePageError(false)
      setMovieReload(false);
    } catch (error) {
      console.error("Error fetching movie details:", error);
      setMovieReload(false);
    }
  };

  const setInitialEpisode = (mvDetail: any) => {
    if (mvDetail) {
      const playBackInfo = mvDetail.last_playback;
      if (playBackInfo && playBackInfo.movie_from) {
        const sourceIndex = mvDetail?.play_from?.findIndex(
          (x: any) => x.code === playBackInfo.movie_from
        );
        if (sourceIndex > -1) {
          const episodeIndex = mvDetail?.play_from[
            sourceIndex
          ]?.list?.findIndex(
            (x: any) => x.episode_id === playBackInfo.episode_id
          );
          if (episodeIndex > -1) {
            setCurrentEpisode(
              mvDetail?.play_from[sourceIndex]?.list[episodeIndex]
            );
            setEpisodes(mvDetail?.play_from[sourceIndex]?.list);
            setResumeTime(playBackInfo.current_time);
            return;
          }
        }
        if (!playBackInfo.ready_to_play) {
          setWholePageError(true);
          setErrorVideoUrl(playBackInfo?.play_url);
        }
      } else {
        // Fallback to the first available episode
        if (mvDetail?.play_from?.[0]?.list?.[0]) {
          setCurrentEpisode(mvDetail?.play_from[0].list[0]);
          setResumeTime(0);
          setEpisodes(mvDetail?.play_from[0].list);
        } else {
          setWholePageError(true);
        }
        if (
          mvDetail?.play_from?.[0]?.list?.[0] &&
          !mvDetail?.play_from?.[0]?.list?.[0].ready_to_play
        ) {
          setWholePageError(true);
          setErrorVideoUrl(mvDetail?.play_from?.[0]?.list?.[0].play_url);
        }
        if(mvDetail?.play_from && mvDetail?.play_from.length === 0) {
          setWholePageError(true);
        }
      }
    }
  };

  const handleEpisodeSelect = (episode: Episode) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCurrentEpisode(episode);
    setWholePageError(false);
    setResumeTime(0);
  };

  const navigateBackFunction = () => {
    if (currentEpisode) {
      reportProgress(currentEpisode);
    }
    setCurrentEpisode(null);
    navigate(forwardedCount);
    // navigate("/home");
  };

  const reportProgress = async (episode: Episode) => {
    if (!movieDetail || !episode) return;
    try {
      await reportPlaybackProgress(
        movieDetail.id,
        episode?.episode_id?.toString() || "",
        episode.from_code,
        movieDetail.last_playback?.duration || 0,
        resumeTime || 0
      );
    } catch (error) {
      console.error("Error reporting playback progress:", error);
    }
  };

  const switchNow = () => {
    setWholePageError(false);
    autoPlayNextEpisode();
  };

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);
  
  const handleVideoError = (errorUrl: string) => {
    if (errorVideoUrl !== errorUrl && errorUrl) {
      setErrorVideoUrl(errorUrl);
      setWholePageError(true);
    }
  };

  const handleChangeSource = async (nextSource: any) => {
    if (nextSource && nextSource.code && id) {
      try {
        const res = await getEpisodesBySource(nextSource.code, id || "");
        setCurrentEpisode(res.data[0]);
        setEpisodes(res.data);
        if (res.data?.[0]?.ready_to_play) {
          setWholePageError(false);
        } else {
          setWholePageError(true);
          setErrorVideoUrl(res.data?.[0]?.play_url);
        }
      } catch (error) {
        console.error("Error auto-playing next episode:", error);
      }
    }
  };

  const refresh = () => {
    // setCurrentEpisode(null);
    setMovieReload(true);
    fetchMovieDetail(movieDetail?.id);
  }

  const showRecommandMovie = (id: string) => {
    setCurrentEpisode(null);
    setMovieDetail(null);
    fetchMovieDetail(id);
  }
  return (
    <div className="bg-background min-h-screen">
      {!movieDetail ? (
        <div className="flex justify-center items-center pt-52 bg-background">
          <Loader />
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-50">
            <div id='upper-div'>
            {(currentEpisode && currentEpisode.ready_to_play && !wholePageError) || movieReload ? (
              <VideoPlayer
                key={currentEpisode?.episode_id}
                videoUrl={currentEpisode?.play_url || ''}
                onBack={navigateBackFunction}
                movieDetail={movieDetail}
                selectedEpisode={currentEpisode}
                resumeTime={resumeTime}
                handleVideoError={handleVideoError}
              />
            ) : (
              <NetworkError switchNow={switchNow} refresh={refresh} onBack={navigateBackFunction}/>
            )}
            
            </div>
            <div className="relative flex px-2 justify-between items-center bg-background" style={{paddingBottom: '10px', borderBottom: '2px solid #2a2a2a'}}>
              <div className="flex">
                <div
                  className={`px-4 py-3 bg-background text-gray-400 rounded-t-lg cursor-pointer relative ${
                    activeTab === "tab-1" ? "text-white z-10" : ""
                  }`}
                  onClick={() => setActiveTab("tab-1")}
                >
                  <span className="text-white">详情{movieReload}</span>
                  {activeTab === "tab-1" && (
                    <div className="absolute bottom-0 left-3 w-4/6 h-1 bg-mainColor rounded-md"></div>
                  )}
                </div>
                <div
                  className={`px-4 py-3 bg-background text-gray-400 rounded-t-lg cursor-pointer relative ${
                    activeTab === "tab-2" ? "text-white z-10" : ""
                  }`}
                  onClick={() => setActiveTab("tab-2")}
                >
                  <span>评论</span>
                  <span className="text-gray-500 ml-1.5 text-sm">
                    {commentCount > 99 ? '99+' : (commentCount || '')}
                  </span>
                  {activeTab === "tab-2" && (
                    <div className="absolute bottom-0 left-3.5 w-3/6 h-1 bg-mainColor rounded-md"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={`${activeTab === "tab-1" && "overflow-y-scroll"}`}>
            <DetailSection
              adsData={adsData}
              movieDetail={movieDetail}
              id={id || ""}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setCommentCount={setCommentCount}
              commentCount={commentCount}
            />
            {activeTab === "tab-1" && (
              <>
                <SourceSelector
                  changeSource={handleChangeSource}
                  episodes={episodes || []}
                  selectedEpisode={currentEpisode}
                  onEpisodeSelect={handleEpisodeSelect}
                  movieDetail={movieDetail}
                  selectedSource={selectedSource}
                  setSelectedSource={setSelectedSource}
                />
                <EpisodeSelector
                  episodes={episodes || []}
                  onEpisodeSelect={handleEpisodeSelect}
                  selectedEpisode={currentEpisode}
                />

                <div className="mt-8 px-4">
                {/* {adsData && <AdsSection adsDataList={adsData?.player_recommend_up} />} */}
                <NewAds section={"player_recommend_up"} fromMovie={true}/>
                </div>
                <RecommendedList data={movieDetail} showRecommandMovie={showRecommandMovie}/>
              </>
            )}
          </div>
        </>
      )}
      {visible && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background text-white text-lg font-medium px-4 py-2 rounded-lg shadow-md">
            没有更多资源了
          </div>
        )}
    </div>
  );
};

export default DetailPage;
