
import { Body, Controller, Get, Header, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiService } from './api.service';
const { exec } = require('child_process');
const fs = require('fs');
const git = require('simple-git/promise');
const hash = require('object-hash');
var ncp = require('ncp').ncp;
const path = require('path');
const rimraf = require('rimraf');

const rootPath = path.resolve(__dirname, '../..');
const tmpPath = path.resolve(rootPath, './generate');
const svgPath = path.resolve(rootPath, './assets');
const archiveName = 'icons-sncf.zip';

class DownloadDto {
  readonly icons: any;
  readonly withFont: boolean;
  readonly withPng: boolean;
  readonly withSvg: boolean;
  readonly withSize: number;
  readonly withColor: string;
  get name(): any { return this.icons }
}

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('download/:id')
  async findArchive(
    @Param() param,
    @Res() res: Response,
  ) {
    const outputPath = path.join(tmpPath, param.id);
    const archivePath = path.join(outputPath, 'icons-sncf.zip');

    if (fs.existsSync(archivePath)) {
      res.download(archivePath, archiveName, function (err) {
        if (err) {
          // Handle error, but keep in mind the response may be partially-sent
          // so check res.headersSent
          console.log('err: ', err);
        } else {
          // decrement a download credit, etc.
          console.log('download');
        }
      })
    }
  }

  @Post('download')
  @Header('Content-type', 'application/json')
  async findAll(@Res() res: Response, @Body() body: DownloadDto) {
    const { icons, withFont, withPng, withSvg, withSize, withColor } = body;

    if (!icons) {
      return;
    }

    const id = hash(body);
    const outputPath = path.join(tmpPath, id);
    const destPath = path.join(outputPath, 'src');
    const archivePath = path.join(outputPath, archiveName);
    const svgDest = withSvg ? path.join(destPath, 'svg') : path.join(outputPath, 'svg');
    const directories = [tmpPath, outputPath, destPath];
    if ((withPng && withColor) || withSvg) { directories.push(svgDest) };
    this.apiService.createDirectory(directories);

    if (fs.existsSync(archivePath)) {
      res.status(HttpStatus.OK).json(id);
      return;
    }

    if (withFont) {
      const svgs = icons.map(name => path.join(svgPath, `${name}.svg`));
      await this.apiService.createWebfont(svgs, path.join(destPath, 'font'));
    }

    if ((withPng && withColor) || (withSvg && withColor)) {
      await this.apiService.replaceColor(icons, svgPath, svgDest, withColor);
    }

    if (withPng) {
      const pngDest = path.join(destPath, 'png');
      this.apiService.createDirectory([pngDest]);
      await this.apiService.createPngs(icons, withColor ? svgDest : svgPath, pngDest, withSize);
    }

    if (withSvg) {
      if (!withColor) {
        await this.apiService.copySvgs(
          icons.map(name => path.join(svgPath, `${name}.svg`)),
          svgDest
        );
      }

      if (withSize) {
        await this.apiService.resizeSvgs(
          icons.map(name => path.join(withColor ? svgDest : svgPath, `${name}.svg`)),
          withSize,
        );
      }
    }

    const stream = fs.createWriteStream(archivePath);
    stream.on('close', function() {
      res.status(HttpStatus.OK).json(id);
      return;
    });

    this.apiService.createArchive(stream, destPath);
    return;
  }

  @Get('update')
  async update() {
    rimraf(tmpPath, {}, () => console.log('tmp folder delete'));

    const pathProject = 'https://github.com/SNCFdevelopers/bootstrap-sncf.git';
    const assetsPath = path.resolve(rootPath, 'bootstrap-sncf');

    await this.apiService.getBootstrapIcon(pathProject, assetsPath);

    ncp(`${assetsPath}/src/assets/icons`, svgPath, function (err) {
      if (err) {
        return console.error(err);
      }

      rimraf(assetsPath, {}, () => {
        return 'Succefull update.';
      });
    });

    return;
  }
}
