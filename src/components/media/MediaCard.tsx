import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  decodeTMDBId,
  getMediaDetails,
  mediaItemToId,
} from "@/backend/metadata/tmdb";
import { TMDBContentTypes } from "@/backend/metadata/types/tmdb";
import { DotList } from "@/components/text/DotList";
import { Flare } from "@/components/utils/Flare";
import { useSearchQuery } from "@/hooks/useSearchQuery";
import { MediaItem } from "@/utils/mediaTypes";

import { MediaBookmarkButton } from "./MediaBookmark";
import { IconPatch } from "../buttons/IconPatch";
import { Icons } from "../Icon";

// Extend MediaItem to include TMDB fields
interface EnhancedMediaItem extends MediaItem {
  overview?: string;
  VoteAverage?: number;
  cast?: Array<{
    name: string;
    character?: string;
  }>;
}

interface MediaCardProps {
  media: EnhancedMediaItem;
  linkable?: boolean;
  series?: {
    episode: number;
    season?: number;
    episodeId: string;
    seasonId: string;
  };
  percentage?: number;
  closable?: boolean;
  onClose?: () => void;
}

function MediaCardTooltip({
  overview,
  VoteAverage,
  cast,
}: {
  overview?: string;
  VoteAverage?: number;
  cast?: Array<{ name: string; character?: string }>;
}) {
  if (!overview && VoteAverage === undefined && !cast?.length) return null;

  return (
    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-0 ml-4 w-72 rounded-lg bg-background-main/95 p-4 shadow-lg transition-all duration-200 z-50">
      <div className="absolute -left-2 top-0 w-2 h-full" />{" "}
      {/* Invisible bridge to prevent hover gap */}
      {VoteAverage !== undefined && (
        <div className="mb-2 flex items-center">
          <span
            className="mr-1 text-yellow-400"
            dangerouslySetInnerHTML={{
              __html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 576 512"><path d="M288 448l-96 64 32-112-96-64h120l32-112 32 112h120l-96 64 32 112z"/></svg>`,
            }}
          />
          <span className="text-sm font-bold text-white">
            {(VoteAverage / 2).toFixed(1)}/5
          </span>
        </div>
      )}
      {overview && (
        <p className="text-sm text-gray-300 whitespace-normal break-words overflow-y-auto max-h-32 pr-2 mb-3">
          {overview}
        </p>
      )}
      {cast && cast.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <p className="text-sm font-semibold text-white mb-2">Cast</p>
          <div className="text-sm text-gray-300 space-y-1 max-h-24 overflow-y-auto pr-2">
            {cast.slice(0, 5).map((actor, index) => (
              <div key={index} className="flex justify-between">
                <span className="font-medium">{actor.name}</span>
                {actor.character && (
                  <span className="text-gray-400 text-xs ml-2">
                    as {actor.character}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function checkReleased(media: MediaItem): boolean {
  const isReleasedYear = Boolean(
    media.year && media.year <= new Date().getFullYear(),
  );
  const isReleasedDate = Boolean(
    media.release_date && media.release_date <= new Date(),
  );
  return media.release_date ? isReleasedDate : isReleasedYear;
}

function MediaCardContent({
  media,
  linkable,
  series,
  percentage,
  closable,
  onClose,
}: MediaCardProps) {
  const { t } = useTranslation();
  const [enhancedMedia, setEnhancedMedia] = useState<EnhancedMediaItem>(media);
  const percentageString = `${Math.round(percentage ?? 0).toFixed(0)}%`;
  const isReleased = useCallback(() => checkReleased(media), [media]);
  const canLink = linkable && !closable && isReleased();
  const dotListContent = [t(`media.types.${media.type}`)];
  const [searchQuery] = useSearchQuery();

  useEffect(() => {
    async function fetchMediaDetails() {
      try {
        const decodedId = decodeTMDBId(mediaItemToId(media));
        if (!decodedId) return;

        const type =
          media.type === "movie" ? TMDBContentTypes.MOVIE : TMDBContentTypes.TV;
        const details = await getMediaDetails(decodedId.id, type);

        // Assuming getMediaDetails now includes credits/cast information
        setEnhancedMedia((prev) => ({
          ...prev,
          overview: details.overview ?? undefined,
          VoteAverage: details.vote_average ?? undefined,
          cast:
            details.credits?.cast?.map((member) => ({
              name: member.name,
              character: member.character,
            })) ?? undefined,
        }));
      } catch (error) {
        console.error("Error fetching media details:", error);
      }
    }

    fetchMediaDetails();
  }, [media]);

  if (media.year) {
    dotListContent.push(media.year.toFixed());
  }

  if (!isReleased()) {
    dotListContent.push(t("media.unreleased"));
  }

  return (
    <div className="relative group">
      <Flare.Base
        className={`-m-[0.705em] rounded-xl bg-background-main transition-colors duration-300 focus:relative focus:z-10 ${
          canLink ? "hover:bg-mediaCard-hoverBackground tabbable" : ""
        }`}
        tabIndex={canLink ? 0 : -1}
        onKeyUp={(e) => e.key === "Enter" && e.currentTarget.click()}
      >
        <Flare.Light
          flareSize={300}
          cssColorVar="--colors-mediaCard-hoverAccent"
          backgroundClass="bg-mediaCard-hoverBackground duration-100"
          className={classNames({
            "rounded-xl bg-background-main group-hover:opacity-100": canLink,
          })}
        />
        <Flare.Child
          className={`pointer-events-auto relative mb-2 p-[0.4em] transition-transform duration-300 ${
            canLink ? "group-hover:scale-95" : "opacity-60"
          }`}
        >
          <div
            className={classNames(
              "relative mb-4 pb-[150%] w-full overflow-hidden rounded-xl bg-mediaCard-hoverBackground bg-cover bg-center transition-[border-radius] duration-300",
              {
                "group-hover:rounded-lg": canLink,
              },
            )}
            style={{
              backgroundImage: media.poster
                ? `url(${media.poster})`
                : undefined,
            }}
          >
            {series ? (
              <div className="absolute right-2 top-2 rounded-md bg-mediaCard-badge px-2 py-1 transition-colors">
                <p
                  className={[
                    "text-center text-xs font-bold text-mediaCard-badgeText transition-colors",
                    closable ? "" : "group-hover:text-white",
                  ].join(" ")}
                >
                  {t("media.episodeDisplay", {
                    season: series.season || 1,
                    episode: series.episode,
                  })}
                </p>
              </div>
            ) : null}

            {percentage !== undefined ? (
              <>
                <div
                  className={`absolute inset-x-0 -bottom-px pb-1 h-12 bg-gradient-to-t from-mediaCard-shadow to-transparent transition-colors ${
                    canLink ? "group-hover:from-mediaCard-hoverShadow" : ""
                  }`}
                />
                <div
                  className={`absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-mediaCard-shadow to-transparent transition-colors ${
                    canLink ? "group-hover:from-mediaCard-hoverShadow" : ""
                  }`}
                />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="relative h-1 overflow-hidden rounded-full bg-mediaCard-barColor">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-mediaCard-barFillColor"
                      style={{
                        width: percentageString,
                      }}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {searchQuery.length > 0 ? (
              <div className="absolute" onClick={(e) => e.preventDefault()}>
                <MediaBookmarkButton media={media} />
              </div>
            ) : null}

            <div
              className={`absolute inset-0 flex items-center justify-center bg-mediaCard-badge bg-opacity-80 transition-opacity duration-500 ${
                closable ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <IconPatch
                clickable
                className="text-2xl text-mediaCard-badgeText transition-transform hover:scale-110 duration-500"
                onClick={() => closable && onClose?.()}
                icon={Icons.X}
              />
            </div>
          </div>
          <h1 className="mb-1 line-clamp-3 max-h-[4.5rem] text-ellipsis break-words font-bold text-white">
            <span>{media.title}</span>
          </h1>
          <DotList className="text-xs" content={dotListContent} />
        </Flare.Child>
      </Flare.Base>

      <MediaCardTooltip
        overview={enhancedMedia.overview}
        VoteAverage={enhancedMedia.VoteAverage}
        cast={enhancedMedia.cast}
      />
    </div>
  );
}

export function MediaCard(props: MediaCardProps) {
  const content = <MediaCardContent {...props} />;
  const isReleased = useCallback(
    () => checkReleased(props.media),
    [props.media],
  );
  const canLink = props.linkable && !props.closable && isReleased();

  let link = canLink
    ? `/media/${encodeURIComponent(mediaItemToId(props.media))}`
    : "#";
  if (canLink && props.series) {
    if (props.series.season === 0 && !props.series.episodeId) {
      link += `/${encodeURIComponent(props.series.seasonId)}`;
    } else {
      link += `/${encodeURIComponent(
        props.series.seasonId,
      )}/${encodeURIComponent(props.series.episodeId)}`;
    }
  }

  if (!canLink) return <span>{content}</span>;
  return (
    <Link
      to={link}
      tabIndex={-1}
      className={classNames(
        "tabbable",
        props.closable ? "hover:cursor-default" : "",
      )}
    >
      {content}
    </Link>
  );
}
