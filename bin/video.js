import fs from "fs";
import ytdl from "ytdl-core";
import Ffmpeg from "fluent-ffmpeg";
import ora from "ora";
import slugify from "slugify";
import path from "path";
// const url = "https://www.youtube.com/watch?v=UD2dZw9iHCc&ab_channel=FunFunFunction";

async function download(url, pathpassed) {
  const data = await ytdl.getInfo(url);
  //   console.log(data);

  const outaudio = `${slugify(data.videoDetails.title, "-")}.mp3`;
  const outvideo = `${slugify(data.videoDetails.title, "-")}.mp4`;
  const mergedfilepath = path.join(pathpassed, `/${slugify(data.videoDetails.title, "-")}-final.mp4`);

  //   console.log(mergedfilepath);

  //   const videoStream = ytdl(url, { filter: (format) => format.container === "mp4", quality: "137" });
  const videoStream = ytdl(url, { quality: "highestvideo" });
  const videowritestream = fs.createWriteStream(outvideo);

  videoStream.pipe(videowritestream);

  await new Promise((res, rej) => {
    // const spinner = ora(`Downloading ${data.videoDetails.title}`).start();

    videowritestream.on("finish", () => {
      //   spinner.succeed();
      res();
    });
    videowritestream.on("error", (err) => {
      rej(err);
      //   spinner.fail();
    });
  });

  //   console.log("Video downloaded successfully!");
  // ytdl(url).pipe(fs.createWriteStream("video.mp4"));

  //   const audioStream = ytdl(url, { filter: (format) => format.codecs === "mp4a.40.2" });
  const audioStream = ytdl(url, { quality: "highestaudio" });
  const audiowritestream = fs.createWriteStream(outaudio);

  audioStream.pipe(audiowritestream);

  await new Promise((res, rej) => {
    // const spinner = ora("Downloading Audio file...").start();

    audiowritestream.on("finish", () => {
      //   spinner.succeed();
      //   const mergedPath = "merged.mp4";

      //   const command = Ffmpeg()
      //     .input(outvideo)
      //     .input(outaudio)
      //     .outputOptions("-c:v copy")
      //     .outputOptions("-c:a copy")
      //     .save(mergedPath)
      //     .on("end", () => {
      //       console.log("Merged download!");
      //     })
      //     .on("error", (err) => {
      //       console.error(err);
      //     });

      //   command.run();
      res();
    });
    audiowritestream.on("error", (err) => {
      rej(err);
    });
  });

  const command = Ffmpeg().input(outvideo).input(outaudio).outputOptions("-c:v copy").outputOptions("-c:a copy").save(mergedfilepath);

  await new Promise((res, rej) => {
    // const spinner = ora(`Finished... ${data.videoDetails.title}`).start();
    command.on("end", () => {
      //   spinner.succeed();
      fs.unlink(outvideo, (err) => {
        if (err) {
          console.error("Error " + err);
        } else {
        }
      });
      fs.unlink(outaudio, (err) => {
        if (err) {
          console.error("Error " + err);
        } else {
        }
      });
      res();
    });
    command.on("error", (err) => {
      //   spinner.fail();
      rej(err);
    });
  });

  return new Date().getTime();
}

export default download;
