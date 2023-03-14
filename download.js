import fs from "fs";
import ytdl from "ytdl-core";
import Ffmpeg from "fluent-ffmpeg";
import stream from "stream";

import ora from "ora";

const url = "https://www.youtube.com/watch?v=UD2dZw9iHCc&ab_channel=FunFunFunction";
const mergedfilepath = "merged1.mp4";

async function download() {
  const videoStream = ytdl(url, { filter: (format) => format.container === "mp4", quality: "137" });
  const audioStream = ytdl(url, { filter: (format) => format.codecs === "mp4a.40.2" });

  //   const videodata = [];
  //   videoStream.on("data", (chunk) => {
  //     videodata.push(chunk);
  //   });

  //   const audiodata = [];
  //   audioStream.on("data", (chunk) => {
  //     audiodata.push(chunk);
  //   });

  const videoPassThrough = new stream.PassThrough();
  const AudioPassThrough = new stream.PassThrough();

  videoStream.pipe(videoPassThrough);
  audioStream.pipe(AudioPassThrough);

  //   audioStream.on("end", () => {
  //     // const videoBuffer = Buffer.concat(videodata);
  //     // const audioBuffer = Buffer.concat(audiodata);

  //   });

  const command = Ffmpeg()
    .input(videoPassThrough)
    .input(AudioPassThrough)
    .outputOptions("-c:v copy")
    .outputOptions("-c:a copy")
    .save(mergedfilepath)
    .on("end", () => {
      console.log("Downloaded and merged");
    })
    .on("error", (err) => {
      console.log(err);
    });
  command.run();
  //   const command = Ffmpeg().addInput(videoStream).addInput(audioStream).save(mergedfilepath).pipe();

  //   const mergedstream = command.pipe();

  //   await new Promise((res, rej) => {
  //     const spinner = ora("Finished downloading video...").start();
  //     command.on("end", () => {
  //       spinner.succeed();
  //       res();
  //     });
  //     command.on("error", (err) => {
  //       spinner.fail();
  //       rej(err);
  //     });
  //   });
}

download();
