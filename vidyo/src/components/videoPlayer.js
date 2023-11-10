import React, { useRef, useState } from 'react';
import './VideoPlayer.css';

function VideoPlayer() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoMetadata, setVideoMetadata] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [isAudioPresent, setIsAudioPresent] = useState(true); // State to track audio presence
  const [waveformVisible, setWaveformVisible] = useState(false); // State to control waveform visibility
  // Declare audioContext at the top level
  const audioContext = new AudioContext();

  const handleVideoInput = (event) => {
    const selectedFile = event.target.files[0];
    const video = videoRef.current;

   

    video.src = URL.createObjectURL(selectedFile);
    //  const video = document.querySelector('video');
    video.onloadedmetadata = () => {
        const duration = video.duration.toFixed(2);
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;  
        // Get the size of the selected file in kilobytes
      const fileSizeKB = (selectedFile.size / 1024).toFixed(2);

      // Get the date of upload in a human-readable format
      const uploadDate = new Date(selectedFile.lastModified).toLocaleDateString();
      // Additional video metadata
      const videoLength = Math.floor(video.duration);
      const frameWidth = video.videoWidth || 'N/A';
      const frameHeight = video.videoHeight || 'N/A';
      const hasAudio = video.mozHasAudio || Boolean(video.webkitAudioDecodedByteCount) || Boolean(video.audioTracks && video.audioTracks.length);

       console.log('hasAudio', hasAudio);
       console.log('video.mozHasAudio',video.mozHasAudio)
       console.log('video.muted',video.muted)
       console.log('video.volume',video.volume)
       console.log('video.webkitAudioDecodedByteCount',video.webkitAudioDecodedByteCount)
      if (!hasAudio || video.muted || video.volume === 0) {
        console.log('This video does not contain audio.');

        alert('Please select a video with audio.');
      event.target.value = ''; 
        setIsAudioPresent(false);
        setVideoMetadata('This video does not contain audio.');
        return; // Prevent further processing
      } else {
        setIsAudioPresent(true);
        renderWaveform()
        // Update video metadata state with all the information
      setVideoMetadata(
        `Duration: ${duration} seconds\n` +
        `Video Size: ${videoWidth}x${videoHeight}\n ` +
        `Size: ${fileSizeKB} KB\n` +
        `Upload Date: ${uploadDate}\n` +
        `Video Length: ${videoLength} seconds\n` +
        `Frame Width: ${frameWidth}\n` +
        `Frame Height: ${frameHeight}`
      );    
      setIsPlaying(true);
      setWaveformVisible(true);
         
      }

       
      
    };
  };


  
  const renderWaveform = () => {
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(videoRef.current);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    
    const dataArray = new Uint8Array(bufferLength);
    console.log('dataArray',dataArray)
    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    
    let iterationCounter = 0;
    const drawWaveform = () => {
        // Check if the video is playing
        if (!videoRef.current.paused) {
          
            analyser.getByteTimeDomainData(dataArray);
            canvasContext.fillStyle = 'rgb(200, 200, 200)';
            canvasContext.fillRect(0, 0, width, height);
            canvasContext.lineWidth = 2;
            canvasContext.strokeStyle = 'rgb(0, 0, 0)';
            canvasContext.beginPath();
    
            const sliceWidth = width * 1.0 / bufferLength;
            // Check if sliceWidth is 1
            
    
            let x = 0;
    
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * height / 2;
                if (v === 1 && sliceWidth===5.78125) {
                  iterationCounter = iterationCounter + 1;
              } else {
                  iterationCounter = 0; // Reset the counter if sliceWidth is not 1
              }
      
              // Print a message after 5-10 continuous iterations
              if (iterationCounter >= 1000 ) {
                  alert("No audio present")
                  // window.history.replace({state:{}})
                  iterationCounter = 0;
                  
                  return window.location.reload()
              }
                if (i === 0) {
                    canvasContext.moveTo(x, y);
                } else {
                    canvasContext.lineTo(x, y);
                }
    
                x += sliceWidth;
            }
    
            canvasContext.lineTo(canvas.width, canvas.height / 2);
            canvasContext.stroke();
        }
    };
    
    audioContext.resume().then(() => {
        // Start drawing the waveform
        setInterval(drawWaveform, 16);
    });
  };
  
  return (
    <div>
      <div className='"row'>
      <div className='col'>
      <label className="custom-file-upload">
      <input type="file" accept="video/*" onChange={handleVideoInput} />
      </label>
      </div>
      </div>
      <div className='row'>
      
      <div className='video-controls'>
        <video ref={videoRef} controls  />
      
      </div>  
      
      <div className='video-metadata'>
        {isAudioPresent ? (
          <div>{videoMetadata}</div>
        ) : (
          <div>{videoMetadata}</div>
        )}
      
      </div>
      
      
      
      </div>
      <div className='row'>
      
      <div className='audio'>  
        <canvas ref={canvasRef} width="740" height="310" style={{ display: waveformVisible ? 'block' : 'none'}} />
      </div>
      </div>
      
      
      
      </div>
    
  );
}

export default VideoPlayer;
