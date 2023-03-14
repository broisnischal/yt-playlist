import chalk from "chalk";
import ytpl from "ytpl";
import process from "node:process";
import ora from "ora";
import download from "./video.js";
import fs from "fs";
import boxen from "boxen";
import slugify from "slugify";
import path from "node:path";
import * as url from "url";
import logSymbols from "log-symbols";

const startTime = new Date().getTime();
const argv = process.argv.slice(1);

async function getPlaylist(args) {
  //   console.log(args);
  if (args.length === 0) {
    console.log(logSymbols.error, chalk.red("Invalid args..."));
    console.log(chalk.blue("Quick start..."));
    console.group();
    console.log(chalk.green("ypld . playlistUrl"), "(OR download-playlist . playlistUrl)");
    console.log(`installs in current directory (${process.cwd()})`);
    console.log("OR");
    console.log(chalk.green("exp Node-tutorial"), "(OR express-draft Node-tutorial)");
    console.log(`installs in "Node-tutorial" directory (${path.join(process.cwd(), "Node-tutorial")})`);
    console.groupEnd();
    process.exit(1);
  }
  const id = argv[1]?.split("=")[1];
  //   console.log(argv);

  const spinner = ora(`${chalk.greenBright("Loading")} ${chalk.yellow("Videos to download...")}`).start();

  return new Promise(async (res, rej) => {
    try {
      const data = await ytpl(id);
      if (data) {
        spinner.succeed();
        res(data);
      } else {
        spinner.fail();
        rej(data);
      }
      //   if (!id) rej("Invalid id passed!");
    } catch (error) {
      if (error) {
        console.log(chalk.red("\nInvalid id passed | neterr 0"));
        process.exit(1);
      }
    }
  });
}

const playlist = await getPlaylist(argv);

console.log(boxen(`${playlist.title}`, { padding: 1 }));
const totalVideos = playlist.estimatedItemCount;
// const items = playlist.items.slice(-2);
const items = playlist.items;
// console.log(items);

async function downloadAllVideos() {
  const rootdir = path.join(process.cwd(), argv[0]);
  console.log(rootdir);
  const folderName = path.resolve(rootdir, slugify(playlist.title, "-"));
  //   console.log(folderName);
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {
    console.error(err);
  }

  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

  const date = new Date().getTime();

  const promises = [];
  const totalItems = items.length;

  console.log("Total videos to download :", chalk.yellowBright(items.length));

  for (let i = 0; i < totalItems; i += 10) {
    const chunk = items.slice(i, i + 10);
    const chunkpromise = chunk.map((item) => download(item.url, folderName));
    promises.push(Promise.all(chunkpromise));
  }

  //   const frames = [
  //     "Please wait a moment, Downloading video",
  //     "Please wait a moment, Downloading video.",
  //     "Please wait a moment, Downloading video..",
  //     "Please wait a moment, Downloading video...",
  //   ];
  //   let i = 0;
  //   setInterval(() => {
  //     const frame = frames[i++ % frames.length];
  //     logUpdate(frame);
  //   }, 200);
  const spi = ora(chalk.green(`Downloading videos 🚀`)).start();

  try {
    await Promise.all(promises);
    spi.succeed();
    // console.log(new Date().getTime() - date);

    const endTime = new Date().getTime();
    const timeDifference = (endTime - startTime) / 1000;
    console.log(`\n✅ Done in ${timeDifference} seconds ✨`);
    console.log("Happy Learning 🦄\n");
  } catch (error) {
    spi.fail();
    console.error(error);
  }

  //   function downloadNextVideo() {
  //     if (i < items.length) {
  //       const item = items[i];

  //       i++;

  //       download(item.url, path)
  //         .then(() => {
  //           downloadNextVideo();
  //         })
  //         .catch((err) => {
  //           spinner.fail();
  //           console.error(err);
  //         });
  //     } else {
  //       spinner.succeed();
  //       console.log(new Date().getTime() - date);
  //     }
  //   }

  //   downloadNextVideo();
}

downloadAllVideos();

// try {
//     items.map(async (item) => {
//       await Promise.resolve().then(() => {
//         download(item.url, path);
//       });
//     });
//     spinner.succeed();
//     console.log(new Date().getTime() - date);
//     res();
//   } catch (error) {
//     spinner.fail();
//     rej(error);
//   }
