import fs from "fs";
import ytdl from "ytdl-core";
import Ffmpeg from "fluent-ffmpeg";
import ora from "ora";
import slugify from "slugify";
import path from "path";

async function download(url, pathpassed) {
  try {
    const data = await ytdl.getInfo(url);
    const videoTitleSlug = slugify(data.videoDetails.title, "-");
    const outaudio = `${videoTitleSlug}.mp3`;
    const outvideo = `${videoTitleSlug}.mp4`;
    const mergedfilepath = path.join(pathpassed, `/${videoTitleSlug}-final.mp4`);

    const videoStream = ytdl(url, { quality: "highestvideo" });
    const videowritestream = fs.createWriteStream(outvideo);

    videoStream.pipe(videowritestream);

    await new Promise((res, rej) => {
      const spinner = ora(`Downloading ${data.videoDetails.title}`).start();

      videowritestream.on("finish", () => {
        spinner.succeed();
        res();
      });

      videowritestream.on("error", (err) => {
        rej(err);
        spinner.fail();
      });
    });

    const audioStream = ytdl(url, { quality: "highestaudio" });
    const audiowritestream = fs.createWriteStream(outaudio);

    audioStream.pipe(audiowritestream);

    await new Promise((res, rej) => {
      const spinner = ora("Downloading Audio file...").start();

      audiowritestream.on("finish", () => {
        spinner.succeed();
        res();
      });

      audiowritestream.on("error", (err) => {
        rej(err);
        spinner.fail();
      });
    });

    const command = Ffmpeg().input(outvideo).input(outaudio).outputOptions("-c:v copy").outputOptions("-c:a copy").save(mergedfilepath);

    await new Promise((res, rej) => {
      const spinner = ora(`Finished... ${data.videoDetails.title}`).start();
      command.on("end", () => {
        spinner.succeed();
        fs.unlink(outvideo, (err) => {
          if (err) {
            console.error("Error " + err);
          }
        });
        fs.unlink(outaudio, (err) => {
          if (err) {
            console.error("Error " + err);
          }
        });
        res();
      });
      command.on("error", (err) => {
        spinner.fail();
        rej(err);
      });
    });

    return new Date().getTime();
  } catch (err) {
    console.error(`Error downloading video: ${err}`);
  }
}

export default download;
