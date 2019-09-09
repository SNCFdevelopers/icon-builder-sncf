
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiService } from './api.service';
const copyfiles = require('copyfiles');
const fs = require('fs');
const hash = require('object-hash');
const path = require('path');
const replace = require('replace-in-file');
const sharp = require('sharp');

const tmpPath = path.resolve(__dirname, './_tmp');
const svgSrcPath = path.resolve(__dirname, './assets/svg');

const ICON_NAMES = ['circle-arrow', 'circle-back-top'];

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('font')
  findAll(
    @Res() res: Response,
  ) {
    const id = `fonts${hash(ICON_NAMES)}`;
    const svgs = ICON_NAMES.map(name => path.join(svgSrcPath, `${name}.svg`));
    const output = path.join(tmpPath, id);
    const archivePath = path.join(output, 'font.zip');

    if (fs.existsSync(archivePath)) {
      console.log('The archive already exists.');
      res.download(archivePath);
      return;
    }

    this.apiService.createDirectory([tmpPath, output]);
    this.apiService.generateWebfont(svgs, path.join(output, 'fonts'))
      .then(() => {
        const stream = fs.createWriteStream(archivePath);
        stream.on('close', function() {
          res.download(archivePath);
        });
    
        this.apiService.createArchive(stream, `${output}/fonts/`);
      })
      .catch(error => console.log(error));

    return;
  }

  @Get('png')
  async findPng(
    @Res() res: Response,
  ) {
    const id = `pngs${hash(ICON_NAMES)}`;
    const output = path.join(tmpPath, id);
    const archivePath = path.join(output, 'png.zip');

    if (fs.existsSync(archivePath)) {
      console.log('The archive already exists.');
      res.download(archivePath);
      return;
    }

    this.apiService.createDirectory([tmpPath, output, path.join(output, 'pngs')]);
    for (let index = 0; index < ICON_NAMES.length; index++) {
      await sharp(path.join(svgSrcPath, `${ICON_NAMES[index]}.svg`))
        .resize({
          width: 200,
          height: 200,
          fit: sharp.fit.cover,
        })
        .png()
        .toFile(path.join(output, 'pngs', `${ICON_NAMES[index]}.png`));
    }

    const stream = fs.createWriteStream(archivePath);
    stream.on('close', function() {
      res.download(archivePath);
    });

    this.apiService.createArchive(stream, `${output}/pngs/`);

    return;
  }

  @Get('svg')
  async findSvg(
    @Res() res: Response,
  ) {
    const id = `svgs${hash(ICON_NAMES)}`;
    const output = path.join(tmpPath, id);
    const svgsOutput = path.join(output, 'svgs');
    const archivePath = path.join(output, 'svg.zip');
    const iconsSrc = [];
    const iconsOutput = [];

    // if (fs.existsSync(archivePath)) {
    //   console.log('The archive already exists.');
    //   res.download(archivePath);
    //   return;
    // }

    this.apiService.createDirectory([tmpPath, output, path.join(output, 'svgs')]);
    for (let index = 0; index < ICON_NAMES.length; index++) {
      const icon = `${ICON_NAMES[index]}.svg`;
      const iconSrc = path.join(svgSrcPath, icon);
      const iconOutput = path.join(svgsOutput, icon);
      iconsSrc.push(iconSrc);
      iconsOutput.push(iconOutput);
    }

    copyfiles([...iconsSrc, svgsOutput], true, () => {
      console.log('Files copied');
      replace({
        files: iconsOutput,
        from: 'viewBox="0 0 500 500"',
        to: 'viewBox="0 0 200 200"',
      })
        .then(results => {
          console.log('Replacement results:', results);
          const stream = fs.createWriteStream(archivePath);
          stream.on('close', function() {
            res.download(archivePath);
          });

          this.apiService.createArchive(stream, `${output}/svgs/`);
        })
        .catch(error => {
          console.error('Error occurred:', error);
        });
    });

    return;
  }
}
