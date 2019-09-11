
import { Body, Controller, Get, Header, HttpStatus, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiService } from './api.service';
const fs = require('fs');
const hash = require('object-hash');
const path = require('path');

const tmpPath = path.resolve(__dirname, './_tmp');
const svgPath = path.resolve(__dirname, './assets/svg');

const ICON_NAMES = ['circle-arrow', 'circle-back-top'];
const BODY = {
  icons: ICON_NAMES,
  withFont: true,
  withPng: true,
  withSvg: true,
  withSize: 200,
  withColor: '#3cff00',
};

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('download')
  @Header('Content-type', 'application/json')
  async findAll(
    @Body() body,
    @Res() res: Response,
  ) {
    const params = BODY;
    const { icons, withFont, withPng, withSvg, withSize, withColor } = params;

    if (!icons) {
      return;
    }

    const outputPath = path.join(tmpPath, hash(params));
    const destPath = path.join(outputPath, 'src');
    const archivePath = path.join(outputPath, 'icons-sncf.zip');
    const svgDest = withSvg ? path.join(destPath, 'svg') : path.join(outputPath, 'svg');
    const directories = [tmpPath, outputPath, destPath];
    if ((withPng && withColor) || withSvg) { directories.push(svgDest) };
    this.apiService.createDirectory(directories);

    if (fs.existsSync(archivePath)) {
      res.download(archivePath);
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
        const iconsOutput = icons.map(name => path.join(withColor ? svgDest : svgPath, `${name}.svg`));
        await this.apiService.resizeSvgs(
          icons.map(name => path.join(withColor ? svgDest : svgPath, `${name}.svg`)),
          withSize,
        );
      }
    }

    const stream = fs.createWriteStream(archivePath);
    stream.on('close', function() {
      res.download(archivePath);
    });

    this.apiService.createArchive(stream, destPath);
    return;
  }
}
