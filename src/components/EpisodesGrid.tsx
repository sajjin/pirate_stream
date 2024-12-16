import React from 'react';
import { Episode, Season } from '../types';

interface EpisodesGridProps {
  season: Season | undefined;
  selectedSeason: string;
  currentEpisode: string | undefined;
  currentSeason: string | undefined;
  onEpisodeSelect: (episode: Episode) => void;
}

export const EpisodesGrid: React.FC<EpisodesGridProps> = ({
  season,
  selectedSeason,
  currentEpisode,
  currentSeason,
  onEpisodeSelect,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {season?.episodes.map((episode) => {
        const isCurrentEpisode = currentEpisode === episode.Episode && 
                                currentSeason === selectedSeason;
        
        return (
          <div
            key={episode.imdbID}
            onClick={() => onEpisodeSelect(episode)}
            className={`
              bg-zinc-900 rounded-lg overflow-hidden cursor-pointer
              transform transition-all duration-300 ease-in-out
              hover:scale-105 hover:shadow-xl hover:z-10
              ${isCurrentEpisode ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-400'}
              group
            `}
          >
            <div className="flex items-center p-4 gap-4">
              <div className="w-[100px] h-[148px] overflow-hidden rounded transition-transform duration-300 group-hover:scale-105">
                <img
                  src={season.poster !== "N/A" ? season.poster : "https://via.placeholder.com/100x148?text=No+Image"}
                  alt={`Season ${selectedSeason} poster`}
                  className="w-full h-full object-cover transform transition-all duration-300 group-hover:brightness-110"
                />
              </div>
              <div className="flex-1 transform transition-all duration-300">
                <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                  {episode.Title}
                </h3>
                <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  Episode {episode.Episode}
                </p>
                <p className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
                  {episode.Released}
                </p>
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-block px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-400 text-sm rounded-full">
                    Watch Now
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};