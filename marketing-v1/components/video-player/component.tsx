import React from 'react';

import ReactPlayer from 'react-player/lazy';

export interface VideoPlayerProps {
  thumbnail?: string;
  url: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ thumbnail, url }: VideoPlayerProps) => (
  <div>
    <ReactPlayer
      className="react-player"
      url={url}
      loop
      muted
      width="auto"
      height="auto"
      light={thumbnail}
      style={{
        width: 'auto',
        height: 'auto',
        minWidth: '100%',
        minHeight: '100%',
      }}
      playing
      config={{
        youtube: {
          playerVars: {
            controls: true,
            showinfo: 0,
            rel: 0,
          },
        },
      }}
    />
  </div>
);

export default VideoPlayer;
