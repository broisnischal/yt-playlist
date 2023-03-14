import chalk from "chalk";
import ytpl from "ytpl";
import logSymbols from "log-symbols";
import process from "node:process";
import ora from "ora";
import download from "./video.js";
import fs from "fs";
import slugify from "slugify";
import path from "node:path";
import * as url from "url";

const argv = process.argv.slice(2);

function getPlaylist(id) {
  const spinner = ora(`Loading ${chalk.yellow("Videos to download...")}`).start();

  return new Promise(async (res, rej) => {
    const data = await ytpl(id);
    if (data) {
      spinner.succeed();
      res(data);
    } else {
      spinner.fail();
      rej(data);
    }
    if (!id) rej("Invalid id passed!");
  });
}

const playlist = await getPlaylist(argv[0].split("=")[1]);

console.log(playlist.title);
const totalVideos = playlist.estimatedItemCount;
// const items = playlist.items.slice(-5);
const items = playlist.items;
// console.log(items);

async function downloadAllVideos() {
  const folderName = slugify(playlist.title, "-");
  //   console.log(folderName);
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {
    console.error(err);
  }

  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

  const path = __dirname + folderName;

  const date = new Date().getTime();

  const spinner = ora(chalk.green("Downloading started...")).start();

  const promises = [];

  for (let i = 0; i < items.length; i += 10) {
    const chunk = items.slice(i, i + 10);
    const chunkpromise = chunk.map((item) => download(item.url, path));
    promises.push(Promise.all(chunkpromise));
  }

  try {
    await Promise.all(promises);
    spinner.succeed();
    console.log(new Date().getTime() - date);
  } catch (error) {
    spinner.fail();
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
