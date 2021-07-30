const { Command } = require("commander");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const cliProgress = require("cli-progress");
const chalk = require("chalk");
const sizeOf = require("image-size");
const pjson = require("./package.json");
//setup
const program = new Command();
program
  .version(pjson.version, "-v")
  .argument("<path>", "pdfにする画像があるフォルダーのパス")
  .parse(process.argv);

const folderPath = program.args[0];
const doc = new PDFDocument({ autoFirstPage: false });
const bar1 = new cliProgress.SingleBar(
  {
    format:
      chalk.green("{bar}") +
      "| {percentage}% | {filename} | ETA: {eta}s | {value}/{total}",
  },
  cliProgress.Presets.shades_classic
);
const pdfName = path.basename(folderPath) + ".pdf";

doc.pipe(fs.createWriteStream(pdfName));

// main process
glob(path.join(__dirname, folderPath, "/*"), null, function (er, files) {
  const dimensions = sizeOf(files[0]);

  bar1.start(files.length, 0);

  files.forEach((file, i) => {
    doc
      .addPage({
        size: [dimensions.width, dimensions.height],
      })
      .image(file, 0, 0, {
        fit: [dimensions.width, dimensions.height],
      });
    bar1.update(i + 1, { filename: path.basename(file) });
  });

  doc.end();
  bar1.stop();

  console.log(chalk.bold.green("\nComplete!\nCheck " + pdfName + "\n"));
});
