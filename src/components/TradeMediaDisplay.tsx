import React, { useRef, useState } from 'react';
import { Play, Pause, Image as ImageIcon, Video, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface TradeMediaDisplayProps {
  images?: string[] | null;
  videos?: string[] | null;
  audios?: string[] | null;
}

const TradeMediaDisplay: React.FC<TradeMediaDisplayProps> = ({
  images,
  videos,
  audios,
}) => {
  const { language } = useLanguage();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const hasImages = images && images.length > 0;
  const hasVideos = videos && videos.length > 0;
  const hasAudios = audios && audios.length > 0;
  const hasAnyMedia = hasImages || hasVideos || hasAudios;

  if (!hasAnyMedia) return null;

  const toggleAudioPlay = (url: string) => {
    const audio = audioRefs.current.get(url);
    if (!audio) return;

    if (playingAudio === url) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      if (playingAudio) {
        const currentAudio = audioRefs.current.get(playingAudio);
        currentAudio?.pause();
      }
      audio.play();
      setPlayingAudio(url);
    }
  };

  const handleAudioEnded = (url: string) => {
    if (playingAudio === url) {
      setPlayingAudio(null);
    }
  };

  const toggleVideoPlay = (url: string) => {
    const video = videoRefs.current.get(url);
    if (!video) return;

    if (playingVideo === url) {
      video.pause();
      setPlayingVideo(null);
    } else {
      if (playingVideo) {
        const currentVideo = videoRefs.current.get(playingVideo);
        currentVideo?.pause();
      }
      video.play();
      setPlayingVideo(url);
    }
  };

  const handleVideoEnded = (url: string) => {
    if (playingVideo === url) {
      setPlayingVideo(null);
    }
  };

  const imageCount = images?.length || 0;
  const videoCount = videos?.length || 0;
  const audioCount = audios?.length || 0;

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      {/* Header with counts */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
        {hasImages && (
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            {imageCount} {language === 'fr' ? 'image(s)' : 'image(s)'}
          </span>
        )}
        {hasVideos && (
          <span className="flex items-center gap-1">
            <Video className="w-3 h-3" />
            {videoCount} {language === 'fr' ? 'vidéo(s)' : 'video(s)'}
          </span>
        )}
        {hasAudios && (
          <span className="flex items-center gap-1">
            <Mic className="w-3 h-3" />
            {audioCount} {language === 'fr' ? 'audio(s)' : 'audio(s)'}
          </span>
        )}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Images */}
        {images?.map((imageUrl, idx) => (
          <a
            key={`img-${idx}`}
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-colors group"
          >
            <img
              src={imageUrl}
              alt={`Trade capture ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute top-1 left-1">
              <div className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/80 text-white">
                <ImageIcon className="w-3 h-3" />
              </div>
            </div>
          </a>
        ))}

        {/* Videos */}
        {videos?.map((videoUrl, idx) => (
          <div
            key={`vid-${idx}`}
            className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer group"
            onClick={() => toggleVideoPlay(videoUrl)}
          >
            <video
              ref={(el) => {
                if (el) videoRefs.current.set(videoUrl, el);
              }}
              src={videoUrl}
              className="w-full h-full object-cover"
              playsInline
              onEnded={() => handleVideoEnded(videoUrl)}
            />
            <div className="absolute top-1 left-1">
              <div className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/80 text-white">
                <Video className="w-3 h-3" />
              </div>
            </div>
            {playingVideo !== videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-black ml-0.5" />
                </div>
              </div>
            )}
            {playingVideo === videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                  <Pause className="w-5 h-5 text-black" />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Audios */}
        {audios?.map((audioUrl, idx) => (
          <div
            key={`aud-${idx}`}
            className={cn(
              "relative aspect-[2/1] rounded-lg overflow-hidden border border-border bg-secondary/30",
              "flex flex-col items-center justify-center p-2 hover:border-primary transition-colors"
            )}
          >
            <audio
              ref={(el) => {
                if (el) audioRefs.current.set(audioUrl, el);
              }}
              src={audioUrl}
              onEnded={() => handleAudioEnded(audioUrl)}
              className="hidden"
            />
            <div className="absolute top-1 left-1">
              <div className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/80 text-white">
                <Mic className="w-3 h-3" />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => toggleAudioPlay(audioUrl)}
              className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30"
            >
              {playingAudio === audioUrl ? (
                <Pause className="w-5 h-5 text-primary" />
              ) : (
                <Play className="w-5 h-5 text-primary" />
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Audio {idx + 1}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeMediaDisplay;
