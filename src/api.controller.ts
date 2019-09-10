
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
  font: true,
  png: true,
  svg: true,
  size: 200,
  color: '#3cff00',
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
    const { icons, font, png, svg, size, color } = params;

    if (!icons) {
      return;
    }

    const outputPath = path.join(tmpPath, hash(params));
    const destPath = path.join(outputPath, 'src');
    const archivePath = path.join(outputPath, 'icons-sncf.zip');

    if (fs.existsSync(archivePath)) {
      res.download(archivePath);
      return;
    }

    this.apiService.createDirectory([tmpPath, outputPath, destPath]);

    if (font) {
      const svgs = icons.map(name => path.join(svgPath, `${name}.svg`));
      await this.apiService.createWebfont(svgs, path.join(destPath, 'font'));
    }

    if (png) {
      this.apiService.createDirectory([path.join(destPath, 'png')]);
      await this.apiService.createPngs(icons, svgPath, path.join(destPath, 'png'), size);
    }

    if (svg) {
      this.apiService.createDirectory([path.join(destPath, 'svg')]);
      await this.apiService.createSvgs(icons, svgPath, path.join(destPath, 'svg'), size, color);
    }

    const stream = fs.createWriteStream(archivePath);
    stream.on('close', function() {
      res.download(archivePath);
    });

    this.apiService.createArchive(stream, destPath);
    return;
  }
}
