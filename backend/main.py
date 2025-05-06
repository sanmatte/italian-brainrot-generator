import uuid
import shutil
from pathlib import Path
import logging

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from moviepy import ImageClip, AudioFileClip, CompositeAudioClip, CompositeVideoClip, VideoFileClip
from moviepy.video.fx import MaskColor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"
VIDEO_DIR = STATIC_DIR / "videos"
TEMP_DIR = BASE_DIR / "temp_files"
MUSIC_FILE_PATH = STATIC_DIR / "music.mp3"

START_DELAY = 1.0
END_PADDING = 3.0

VIDEO_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Italian Brainrot Generator Backend")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/generate-video")
async def create_video(
    audio_file: UploadFile = File(...),
    image_file: UploadFile = File(...),
    options: list = None
):
    temp_id = str(uuid.uuid4())
    # FIX: doesnt look good
    temp_audio_path = TEMP_DIR / \
        f"{temp_id}_audio{Path(audio_file.filename or '.mp3').suffix}"
    temp_image_path = TEMP_DIR / \
        f"{temp_id}_image{Path(image_file.filename or '.jpg').suffix}"
    output_video_filename = f"{temp_id}.mp4"
    output_video_path = VIDEO_DIR / output_video_filename

    audio_tts_clip = None
    audio_tts_delayed = None
    music_clip = None
    music_adjusted_duration = None
    music_adjusted_volume = None
    combined_audio = None
    image_clip_final_duration = None
    final_clip = None

    try:
        if not MUSIC_FILE_PATH.is_file():
            logger.error(f"Music file not found: {MUSIC_FILE_PATH}")
            raise HTTPException(
                status_code=500, detail="Background music file missing.")

        logger.info(f"Processing request {temp_id}. Saving uploaded files.")

        try:
            with open(temp_audio_path, "wb") as buffer:
                shutil.copyfileobj(audio_file.file, buffer)
            with open(temp_image_path, "wb") as buffer:
                shutil.copyfileobj(image_file.file, buffer)
        finally:
            if hasattr(audio_file, 'file') and not audio_file.file.closed:
                audio_file.file.close()
            if hasattr(image_file, 'file') and not image_file.file.closed:
                image_file.file.close()

        logger.info(f"Generating video for {temp_id} using MoviePy.")

        # get TTS audio duration
        audio_tts_clip = AudioFileClip(str(temp_audio_path))
        tts_duration = audio_tts_clip.duration
        if not tts_duration or tts_duration <= 0:
            raise ValueError("Invalid TTS audio duration.")

        # calculate total video duration
        total_video_duration = tts_duration + START_DELAY + END_PADDING
        logger.info(f"TTS Duration: {tts_duration:.2f}s, Total Video Duration: {
                    total_video_duration:.2f}s")

        music_clip = AudioFileClip(str(MUSIC_FILE_PATH))
        music_duration = music_clip.duration
        if not music_duration or music_duration <= 0:
            logger.warning(
                "Music file has invalid duration. Using only TTS audio.")
            # if no music, the combined audio is just the delayed TTS audio extended
            audio_tts_delayed = audio_tts_clip.with_start(START_DELAY)
            combined_audio = audio_tts_delayed.with_duration(
                total_video_duration)
        else:
            logger.info(f"Adjusting background music (Duration: {
                        music_duration:.2f}s) for total duration {total_video_duration:.2f}s")

            if music_duration < total_video_duration:
                music_adjusted_duration = music_clip.loop(
                    duration=total_video_duration)
            else:
                music_adjusted_duration = music_clip.with_duration(
                    total_video_duration)

            volume_factor = 0.8  # set volume slightly lower than TTS track
            music_adjusted_volume = music_adjusted_duration * volume_factor

            audio_tts_delayed = audio_tts_clip.with_start(START_DELAY)

            logger.info("Combining audio tracks...")
            combined_audio = CompositeAudioClip(
                [music_adjusted_volume, audio_tts_delayed])
            combined_audio = combined_audio.with_duration(total_video_duration)

        logger.info("Creating final image clip...")
        image_clip_final_duration = ImageClip(str(temp_image_path),
                                              duration=total_video_duration,
                                              is_mask=False)

        final_clip = image_clip_final_duration.with_audio(combined_audio)

        if final_clip is None or final_clip.audio is None:
            if combined_audio:
                raise ValueError(
                    "Setting combined audio on final clip failed.")
            else:
                raise ValueError("Combined audio generation failed.")

        # # add visual effect
        # fire_effect = VideoFileClip(str(STATIC_DIR / "fire.mp4"), target_resolution=final_clip.size)
        # effect = MaskColor(color=(0, 255, 0)) # see https://zulko.github.io/moviepy/ref/VideoClip/VideoClip.html#moviepy.video.fx.all.MaskColor to use it
        # masked_fire_effect = effect.apply(fire_effect)
        # final_clip = CompositeVideoClip([final_clip, masked_fire_effect]).with_duration(total_video_duration)

        logger.info(f"Writing video file {output_video_path}...")
        final_clip.write_videofile(
            str(output_video_path),
            codec='libx264',
            audio_codec='aac',
            fps=24,
            ffmpeg_params=['-pix_fmt', 'yuv420p'],
            logger=None
        )
        logger.info("Successfully wrote video file.")

        if output_video_path.exists():
            file_size = output_video_path.stat().st_size
            logger.info(f"Generated video file size: {file_size} bytes")
        else:
            logger.error("Video file was NOT created.")
            raise RuntimeError("Video file creation failed silently.")

    except Exception as e:
        logger.error(f"Error during video generation for {
                     temp_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate video: {str(e)}",
        )
    finally:
        logger.info(f"Cleaning up resources for request {temp_id}.")
        clips_to_close = [
            audio_tts_clip, music_clip, music_adjusted_duration,
            music_adjusted_volume, audio_tts_delayed, combined_audio,
            image_clip_final_duration, final_clip
        ]
        for clip in clips_to_close:
            if clip and hasattr(clip, 'close'):
                try:
                    clip.close()
                except Exception as close_err:
                    logger.warning(f"Error closing a clip: {close_err}")
        temp_audio_path.unlink(missing_ok=True)
        temp_image_path.unlink(missing_ok=True)
        logger.info(f"Finished cleanup for request {temp_id}.")

        # TODO: timebased deletion of video and audio files

    # return filename
    logger.info(f"Request {temp_id} completed. Returning video filename: {
                output_video_filename}")
    return {"videoFilename": output_video_filename}


@app.get("/videos/{filename}")
async def get_video(filename: str):
    file_path = VIDEO_DIR / filename
    logger.info(f"Request received to serve video: {file_path}")
    # Security checks...
    if file_path.resolve().parent == VIDEO_DIR.resolve():
        return FileResponse(path=str(file_path), media_type='video/mp4', filename=filename)


@app.get("/")
async def read_root():
    return {"message": "Italian Brainrot Generator Backend is running!"}
