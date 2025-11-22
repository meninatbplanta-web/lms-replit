interface VideoPlayerProps {
  url: string;
  title: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  // Check if it's a YouTube URL
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const isVimeo = url.includes("vimeo.com");

  const getEmbedUrl = (videoUrl: string) => {
    if (videoUrl.includes("youtube.com/watch")) {
      const videoId = new URL(videoUrl).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (videoUrl.includes("youtu.be")) {
      const videoId = videoUrl.split("/").pop()?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (videoUrl.includes("vimeo.com")) {
      const videoId = videoUrl.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return videoUrl;
  };

  if (isYouTube || isVimeo) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={getEmbedUrl(url)}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          data-testid="video-player-iframe"
        />
      </div>
    );
  }

  // Regular MP4 or other video formats
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        controls
        className="w-full h-full"
        data-testid="video-player-native"
      >
        <source src={url} type="video/mp4" />
        Seu navegador não suporta vídeo HTML5.
      </video>
    </div>
  );
}
